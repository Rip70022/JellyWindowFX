# JellyWindowFX

This script provides a window animation effect for desktop environments, adding fun and dynamic behaviors to window management. With this effect, windows wobble like jelly when moved, get sucked into their taskbar icon when minimized or closed, and are spat out when opened. It creates a visually appealing and playful experience for window interactions.

## Features

- **Jelly Wobble Effect:** Windows wobble like jelly when moved around the screen.
- **Taskbar Animation:** Minimized or closed windows smoothly animate to their taskbar icon and vice versa when reopened.
- **Customizable Animations:** Adjust animation speed, scaling, opacity, and wobble strength.

## Installation

1. Copy the script into your `~/.kde/` or relevant directory where you store custom scripts.
2. Ensure the KPlugin structure is supported by your KDE environment.
3. Load the plugin by including the line `loadPlugin("animation");` in the configuration.

## Configuration

You can adjust the following variables in the script to customize the animation:

- **`animationTime`**: Controls the duration of the animation (in milliseconds).
- **`scaleFactor`**: Defines how much the window shrinks when animating to the taskbar icon.
- **`opacityEnd`**: Defines the end opacity of the window during the closing animation (0.0 for invisible).
- **`jellyWobbleStrength`**: Controls the intensity of the jelly wobble effect.
- **`jellyWobbleDuration`**: Sets how long the wobble effect lasts when moving a window.

## Usage

The effect triggers automatically when the following actions occur:

- **Window Minimized:** The window shrinks and animates towards its taskbar icon.
- **Window Opened:** The window animates back from its taskbar icon.
- **Window Moved:** The jelly wobble effect activates when the window is dragged.

## License

This script is released under the **MIT** license.

## Author

- **Rip70022/craxterpy**

## Version

- **1.0**
