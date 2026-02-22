# Woodland Cemetery Website Project
## What is this?
This project is meant to let people find their friends and family that are buried at Woodland Cemetery.  The frontend is mostly complete, though improvements can be made. Additional single grave areas will need to be mapped in the future. Section A in particular is currently mapped, but needs to be converted to an approximated single grave region.  The backend/database is where most of the problems lie as much of the information needs to be updated/fixed.

## Why are there two html files?
Since the main website is built on wix, we need to embed the [index.html](./index.html) file into an iframe on the website.  

Unfortunately, Wix iframes cannot import css and js files easily, so we made a python file that can combine all of the information in [index.html](./index.html), [style.css](./style.css), and [script.js](./script.js) into one big html file, [main.html](./main.html).  

This is not an elegant solution, but it works!

## How To Use
To edit the website, make your changes in the [index.html](./index.html), [style.css](./style.css), and [script.js](./script.js) files and then run ```python converter.py``` to generate [main.html](./main.html).  

Then, copy the contents of the generated file and paste it into the iframe on the wix site.
