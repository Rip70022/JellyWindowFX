.metadata {
    "KPlugin": {
        "Name": "JellyWindowFX",
        "Description": "Makes windows wobble like jelly when moved, get sucked into their taskbar icon when minimized/closed and spat out when opened",
        "Icon": "preferences-system-windows-effect-vacuum",
        "Author": "Rip70022/craxterpy",
        "License": "MIT",
        "Category": "Window Animation",
        "Version": "1.0"
    }
}

loadPlugin("animation");

const animationTime = 350;
const scaleFactor = 0.1;
const opacityEnd = 0.0;
const jellyWobbleStrength = 0.05;
const jellyWobbleDuration = 300;

function setupWindowAnimations() {
    const options = {
        duration: animationTime,
        curve: QEasingCurve.OutExpo
    };

    effect.configureWindowClosed(options);
    effect.configureWindowAdded(options);
    effect.configureWindowMinimized(options);
    effect.configureWindowUnminimized(options);
    
    effect.windowClosed.connect(function(window) {
        if (!window.visible || effect.hasActiveFullScreenEffect) {
            return;
        }
        
        animateToIcon(window);
    });
    
    effect.windowAdded.connect(function(window) {
        if (!window.visible || effect.hasActiveFullScreenEffect || window.popupWindow) {
            return;
        }
        
        animateFromIcon(window);
    });
    
    effect.windowMinimized.connect(function(window) {
        if (!window.visible || effect.hasActiveFullScreenEffect) {
            return;
        }
        
        animateToIcon(window);
    });
    
    effect.windowUnminimized.connect(function(window) {
        if (!window.visible || effect.hasActiveFullScreenEffect) {
            return;
        }
        
        animateFromIcon(window);
    });
    
    workspace.windowMoveStarted.connect(function(window) {
        if (!window.visible || effect.hasActiveFullScreenEffect) {
            return;
        }
        
        window.jellyMode = true;
        applyJellyEffect(window);
    });
    
    workspace.windowMoveFinished.connect(function(window) {
        window.jellyMode = false;
        
        window.animation = animate({
            window: window,
            duration: jellyWobbleDuration * 2.5,
            animations: [
                {
                    type: Effect.Scale,
                    from: { value1: 1.0 + jellyWobbleStrength, value2: 1.0 - jellyWobbleStrength },
                    to: { value1: 1.0, value2: 1.0 },
                    curve: QEasingCurve.OutElastic
                }
            ]
        });
    });
    
    workspace.windowMoveResizeChanged.connect(function(window) {
        if (window.jellyMode) {
            applyJellyEffect(window);
        }
    });
}

function applyJellyEffect(window) {
    if (!window.visible || !window.jellyMode) {
        return;
    }
    
    if (window.animation) {
        cancel(window.animation);
    }
    
    const xWobble = Math.random() * jellyWobbleStrength * (Math.random() > 0.5 ? 1 : -1);
    const yWobble = Math.random() * jellyWobbleStrength * (Math.random() > 0.5 ? 1 : -1);
    
    window.animation = animate({
        window: window,
        duration: jellyWobbleDuration,
        animations: [
            {
                type: Effect.Scale,
                from: { value1: 1.0 + xWobble, value2: 1.0 + yWobble },
                to: { value1: 1.0 - xWobble, value2: 1.0 - yWobble },
                curve: QEasingCurve.InOutQuad
            }
        ]
    });
    
    window.jellytimer = effect.setTimeout(function() {
        if (window.jellyMode) {
            applyJellyEffect(window);
        }
    }, jellyWobbleDuration);
}

function animateToIcon(window) {
    const taskIcon = getWindowTaskbarIcon(window);
    
    if (!taskIcon) {
        defaultCloseAnimation(window);
        return;
    }
    
    window.animation = animate({
        window: window,
        duration: animationTime,
        animations: [
            {
                type: Effect.Scale,
                from: 1.0,
                to: scaleFactor,
                curve: QEasingCurve.OutExpo
            },
            {
                type: Effect.Opacity,
                from: 1.0,
                to: opacityEnd,
                curve: QEasingCurve.OutCubic
            },
            {
                type: Effect.Translation,
                to: {
                    x: taskIcon.x - window.geometry.x - window.geometry.width / 2 + taskIcon.width / 2,
                    y: taskIcon.y - window.geometry.y - window.geometry.height / 2 + taskIcon.height / 2
                },
                curve: QEasingCurve.OutExpo
            }
        ]
    });
}

function animateFromIcon(window) {
    const taskIcon = getWindowTaskbarIcon(window);
    
    if (!taskIcon) {
        defaultOpenAnimation(window);
        return;
    }
    
    const startX = taskIcon.x - window.geometry.x - window.geometry.width / 2 + taskIcon.width / 2;
    const startY = taskIcon.y - window.geometry.y - window.geometry.height / 2 + taskIcon.height / 2;
    
    window.animation = animate({
        window: window,
        duration: animationTime,
        animations: [
            {
                type: Effect.Scale,
                from: scaleFactor,
                to: 1.0,
                curve: QEasingCurve.OutElastic
            },
            {
                type: Effect.Opacity,
                from: opacityEnd,
                to: 1.0,
                curve: QEasingCurve.InCubic
            },
            {
                type: Effect.Translation,
                from: {
                    x: startX,
                    y: startY
                },
                to: {
                    x: 0,
                    y: 0
                },
                curve: QEasingCurve.OutBack
            }
        ]
    });
}

function getWindowTaskbarIcon(window) {
    try {
        const appId = window.resourceClass.toString().toLowerCase();
        
        const panels = workspace.panelIds();
        
        for (let i = 0; i < panels.length; i++) {
            const panel = workspace.panelById(panels[i]);
            
            const taskManager = panel.widgetIds.find(id => 
                id.includes("taskmanager") || id.includes("icontasks"));
                
            if (!taskManager) continue;
            
            const taskButtons = panel.getItemsByType("TaskButton");
            
            for (let j = 0; j < taskButtons.length; j++) {
                const button = taskButtons[j];
                
                if (button.appId.toLowerCase() === appId || 
                    button.windows.includes(window.internalId)) {
                    
                    return {
                        x: button.screenGeometry.x,
                        y: button.screenGeometry.y,
                        width: button.screenGeometry.width,
                        height: button.screenGeometry.height
                    };
                }
            }
        }
    } catch (e) {
        print("Error finding icon: " + e);
    }
    
    return null;
}

function defaultCloseAnimation(window) {
    window.animation = animate({
        window: window,
        duration: animationTime,
        animations: [
            {
                type: Effect.Scale,
                from: 1.0,
                to: scaleFactor,
                curve: QEasingCurve.OutExpo
            },
            {
                type: Effect.Opacity,
                from: 1.0,
                to: opacityEnd,
                curve: QEasingCurve.OutCubic
            }
        ]
    });
}

function defaultOpenAnimation(window) {
    window.animation = animate({
        window: window,
        duration: animationTime,
        animations: [
            {
                type: Effect.Scale,
                from: scaleFactor,
                to: 1.0,
                curve: QEasingCurve.OutElastic
            },
            {
                type: Effect.Opacity,
                from: opacityEnd,
                to: 1.0,
                curve: QEasingCurve.InCubic
            }
        ]
    });
}

setupWindowAnimations();
