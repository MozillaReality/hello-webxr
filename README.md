# Hello WebXR!

![screenshot](assets/sshot.jpg)

[Try it here!](https://mixedreality.mozilla.org/hello-webxr/index.html)

This is a WebXR demo made to celebrate the [WebXR spec](https://immersive-web.github.io/webxr/) release at the end of 2019. It showcases several small experiences, perfect to test different kind of interactions and situations in Virtual Reality. For newcomers, it's a nice entry point to the medium, and web developers may find many things they can reuse and learn (make sure you read the [postmortem article](https://url-of-article-not-ready-yet)!).

## How to build

1. `npm install`
2. `npm run watch`
3. start any http server on the folder and go to localhost url


### Shader packing

If you make changes to the shaders you'll need to repack them. You can use the simple script `packshaders.py`:

`python packshaders.py [seconds]`

where `seconds` is an optional parameter (defaults to 5) to define how many seconds to wait until next rebuild (doesn't watch file changes)


