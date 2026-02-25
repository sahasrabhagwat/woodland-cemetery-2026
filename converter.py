# Opening the source files
html = open("WoodlandCemetery2025-main\index.html", "r")
css = open("WoodlandCemetery2025-main\style.css", "r")
js = open("WoodlandCemetery2025-main\script.js", "r")

# Since we run str.format later, each "{" and "}" needs to be escaped with a "\"
# I also add the equivalent of three tabs to the beginning of each line so that the document is properly formatted.
cssData = css.read()
cssData = cssData.replace("{", "{{")
cssData = cssData.replace("}", "}}")
cssData = cssData.replace("\n", "\n            ")

jsData = js.read()
jsData = jsData.replace("{", "{{")
jsData = jsData.replace("}", "}}")
jsData = jsData.replace("\n", "\n            ")

# Since I can't parse html well in python, I am removing everything before and after the body (with hardcoded indexes :) )
htmlData = html.read()
htmlData = "\n".join(htmlData.split("\n")[10:1994])

# Opening the file where the output will be written
outfile = open("WoodlandCemetery2025-main\main.html", "w")

# Putting the data together into a single string. (It's formatted too!)
intro = "<!-- To anybody editing this document, I am truly sorry for what you are about to witness. -->\n<!-- This is the only way we could find to have CSS and JS work inside of the HTML embed on Wix. -->\n\n<!-- If it helps, here are the locations of the different parts of the code. -->\n<!-- CSS starts on line {cssPos} -->\n<!-- JS starts on line {jsPos} -->\n<!-- HTML body starts on line {htmlPos} -->\n"
data = f"{intro}<!DOCTYPE html>\n<html>\n    <head>\n        <style>\n            {cssData}\n        </style>\n        <script>\n            {jsData}\n        </script>\n    </head>\n{htmlData}\n</html>"

# Finding line numbers for key points
lines = data.split("\n")
for line in lines:
    if "<style>" in line:
        cssPos = lines.index(line) + 1
    elif "<script>" in line:
        jsPos = lines.index(line) + 1
    elif "<body>" in line:
        htmlPos = lines.index(line) + 1

# Adding line numbers to the data
data = data.format(cssPos=cssPos, jsPos=jsPos, htmlPos=htmlPos)
data = data.replace("{{", "{")
data = data.replace("}}", "}")

# Writing the data to the outfile
outfile.write(data)

# Closing all of the files
html.close()
css.close()
js.close()
outfile.close()
