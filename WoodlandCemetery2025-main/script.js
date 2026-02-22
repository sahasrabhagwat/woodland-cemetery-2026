// Constants used when getting the values from the spreadsheet.
const SPREADSHEET_ID = "1oB7kgRwhQm-dYftSOGRPD0xIaAJzecGpxFUHgBup80I";
const API_KEY = "AIzaSyB2nE9aGbN51EuV_S0yGf-IyxvcGGUcDao";

// These constants allow easier access to the data from each google sheet.
// They are indexes for different kinds of data.
// Indexes for the all lots array
const SECTION = 0;
const LOT_NUMBER = 1;
const GRAVE_NUMBER = 2;
const ORIENTATION = 3;
const LAST_NAME = 4;
const FIRST_NAME = 5;
const MIDDLE_NAME = 6;
const TITLE = 8;
const DEATH_DATE = 9;
const BURIAL_DATE = 10;
const NOTES = 11;
const FIND_A_GRAVE_ID = 12;
const SKETCHFAB_ID = 13;
const CONFIRMED = 14;

const SINGLE_GRAVES = ['D', 'ZZ', 'MHillside'];

// Section D row ranges
const SECTION_D_ROWS = [
  { name: "Row1-R", min: 1, max: 28 },
  { name: "Row1-L", min: 29, max: 69 },
  { name: "Row2-R", min: 70, max: 113 },
  { name: "Row2-L", min: 114, max: 142 },
  { name: "Row3-R", min: 143, max: 177 },
  { name: "Row3-L", min: 178, max: 212 },
  { name: "Row4-R", min: 213, max: 245 },
  { name: "Row4-L", min: 246, max: 282 },
  { name: "Row5-R", min: 285, max: 330 },
  { name: "Row5-L", min: 331, max: 364 },
  { name: "Row6-R", min: 420, max: 506 },
  { name: "Row6-L", min: 508, max: 530 },
  { name: "RowX", values: ['92X', '93X', '99 X', '100 X', '138', '152a', '157 X', '208', '210', '280', '289A', '351', '352', '356', '358', '498'] }
];

const SECTION_ZZ_ROWS = [
  { name: "ZZ Section1", ids: ["230054073", "230054100", "sect1-1", "143938754", "143938953", "sect1-2", "221187565", "221187600", "221187583"] },
  { name: "ZZ Section2", ids: ["221187529", "sect2-1", "202165763", "143938936", "202165609", "143938944", "221187489", "221187547", "231054486", "111325431", "231136160"] },
  { name: "ZZ Section3", ids: ["229423287", "227764237", "111325498", "111325473", "227764249", "227764258", "260060445", "143938928", "140896958", "227735397", "260060428", "227515745", "221066010", "143938910"] }
]

/* 
Data structure for info from the google sheet.

sheetData.all contains information for every grave in the cemetery.
sheetData.sga contains information for every grave in the cemetery that has only one person in that lot.
sheetData.notable contains information for the graves of some of the more famous graves in the cemetery.
*/
var sheetData = {
  all: [],
  sga: [],
  notable: [],
};

window.onload = () => {
  // Loading Text
  // This displays while the search bar is loading.
  // The display updates every half second
  let dotCount = 1;
  setInterval(() => {
    // Updates the text
    document.getElementById("loading").innerText =
      "Loading" + ".".repeat(dotCount);

    // Increments the counter
    dotCount = (dotCount % 3) + 1;
  }, 500);

  new Promise(async (resolve) => {
    // Fetching data from the google sheet
    sheetData.all = await getInfo("All Lots");
    sheetData.sga = await getInfo("All SGA");
    sheetData.notable = await getInfo("Notable Burials");

    resolve();
  }).then(() => {
    // Removing the title row from each sheet
    sheetData.all.splice(0, 1);
    sheetData.sga.splice(0, 1);
    sheetData.notable.splice(0, 1);

    // Loading information into the search form
    sheetData.all.forEach((grave, index) => {
      let option = document.createElement("option");

      // Single graves use GRAVE_NUMBER instead of LOT_NUMBER
      if (SINGLE_GRAVES.includes(grave[SECTION])) {
        // Special case for ZZ section
        if (grave[SECTION] === "ZZ") {
          option.value = `${grave[FIRST_NAME]} ${grave[LAST_NAME]} (ZZ)`.replace(
            /  */g,
            " "
          );
        } else {
          option.value = `${grave[FIRST_NAME]} ${grave[LAST_NAME]} (${grave[SECTION]} ${grave[GRAVE_NUMBER]})`.replace(
            /  */g,
            " "
          );
        }
      } else {
        // For all other sections, use LOT_NUMBER
        option.value = `${grave[FIRST_NAME]} ${grave[LAST_NAME]} (${grave[SECTION]} ${grave[LOT_NUMBER]})`.replace(
          /  */g,
          " "
        );
      }

      document.getElementById("name-list").appendChild(option);
    });

    // Overriding the submit event for the form
    let form = document.getElementById("search-form");
    form.onsubmit = (evt) => {
      // Hiding the currently highlighted graves.
      for (let grave of document.getElementsByClassName("grave")) {
        grave.style.opacity = 0;
      }

      evt.preventDefault();

      let info = document.getElementById("name-input").value;
      displayPerson(info);
    };

    // Having the submit button on the form do something.
    let submit = document.getElementById("submit-search-form");
    submit.onclick = () => {
      // Hiding the currently highlighted graves.
      for (let grave of document.getElementsByClassName("grave")) {
        grave.style.opacity = 0;
      }

      // When the form is submitted, get the selected person and display their info.
      let info = document.getElementById("name-input").value;
      displayPerson(info);
    };

    // Displaying the search form
    form.classList.add("fade-in");
    setTimeout(() => {
      form.classList.remove("fade-in");
      form.style.opacity = "1";
    }, 500);

    // Hiding the loading text
    let loading = document.getElementById("loading");
    loading.classList.add("fade-out");
    setTimeout(() => {
      loading.classList.remove("fade-out");
      loading.style.opacity = "0";
    }, 500);
  });

  // Getting the label object.
  var label = document.getElementById("label");

  // Adding event listeners to each landmark.
  var landmarks = document.getElementsByClassName("landmark");
  for (let landmark of landmarks) {
    // Displaying the label for this landmark.
    landmark.onmouseenter = () => {
      label.style.display = "block";
    };

    // Updating the value and position of the label.
    landmark.onmousemove = (evt) => {
      label.style.left = `${evt.clientX + 10}px`;
      label.style.top = `${evt.clientY + 10}px`;

      label.innerText = landmark.classList[1];
    };

    // Hiding the label fot this landmark.
    landmark.onmouseleave = () => {
      label.style.display = "none";
    };
  }

  // Adding event listeners to each grave.
  var graves = document.getElementsByClassName("grave");
  for (let grave of graves) {
    // Displaying the label and the polygon for this grave.
    grave.onmouseover = () => {
      label.style.display = "block";
      grave.style.opacity = 1;
    };

    // Updating the value and position of the label.
    grave.onmousemove = (evt) => {
      label.style.left = `${evt.clientX + 10}px`;
      label.style.top = `${evt.clientY + 10}px`;

      label.innerText = grave.classList[1];
    };

    // Hiding the label and the polygon for this grave.
    grave.onmouseleave = () => {
      label.style.display = "none";
      grave.style.opacity = 0;
    };

    // Displaying the people buried in the selected section.
    grave.onclick = () => {
      displayPlot(grave.classList[1]);
    };
  }

  // Event listener specifically for MHillside section
  var hillsideSection = document.getElementsByClassName("MHillside")[0];
  if (hillsideSection) {
    // Display label and polygon for section on hover
    hillsideSection.onmouseover = () => {
      label.style.display = "block";
      hillsideSection.style.opacity = 1;
    };

    // Updating the value and position of the label
    hillsideSection.onmousemove = (evt) => {
      label.style.left = `${evt.clientX + 10}px`;
      label.style.top = `${evt.clientY + 10}px`;
      label.innerText = "MHillside";
    };

    // Hide when not hovering over
    hillsideSection.onmouseleave = () => {
      label.style.display = "none";
      hillsideSection.style.opacity = 0;
    };

    // On click display all MHillside entries (matchbox)
    hillsideSection.onclick = () => {
      displayPlot("MHillside");
    };
  }

  //Event listener for Section ZZ
  var zzPolygons = document.querySelectorAll('[class^="ZZ "]');
  for (let polygon of zzPolygons) {
    polygon.onmouseover = () => {
      label.style.display = "block";
      polygon.style.opacity = 1;
    };

    polygon.onmousemove = (evt) => {
      label.style.left = `${evt.clientX + 10}px`;
      label.style.top = `${evt.clientY + 10}px`;
      label.innerText = polygon.classList[0];
    };

    polygon.onmouseleave = () => {
      label.style.display = "none";
      polygon.style.opacity = 0;
    };

    polygon.onclick = () => {
      // Extract section number from class name
      let sectionName = polygon.classList[0] + " " + polygon.classList[1];
      displayPlot(sectionName);
    };
  }

  // Event listener specifically for Section D
  var sectionDPolygons = document.querySelectorAll('[class^="D "]');
  for (let polygon of sectionDPolygons) {
    // Display label and polygon for section on hover
    polygon.onmouseover = () => {
      label.style.display = "block";
      polygon.style.opacity = 1;
    };

    // Updating the value and position of the label
    polygon.onmousemove = (evt) => {
      label.style.left = `${evt.clientX + 10}px`;
      label.style.top = `${evt.clientY + 10}px`;
      label.innerText = polygon.classList[0] + " " + polygon.classList[1];
    };

    // Hide when not hovering over
    polygon.onmouseleave = () => {
      label.style.display = "none";
      polygon.style.opacity = 0;
    };

    // On click display all entries for the given row
    polygon.onclick = () => {
      displayPlot(polygon.classList[0] + " " + polygon.classList[1]);
    };
  }

  // Adding the notable burials functionality.
  document.getElementById("show-notable-burials").onclick = () => {
    displayPlot("Notable Burials");
  };

  // Adding click event listeners to the person-hide element.
  document.getElementById("person-hide").onclick = () => {
    document.getElementById("person-data").style.display = "none";

    // Hiding the currently highlighted graves.
    for (let grave of document.getElementsByClassName("grave")) {
      grave.style.opacity = 0;
    }
  };

  // Adding click event listeners to the plot-hide element.
  document.getElementById("plot-hide").onclick = () => {
    document.getElementById("plot-data").style.display = "none";
  };

  // Adding click event listeners to the sketchfab-hide element.
  document.getElementById("sketchfab-hide").onclick = () => {
    document.getElementById("sketchfab-container").style.display = "none";
  };

  /*
  *
  * MOBILE FUNCTIONALITY
  * 
  */

  // Search Button Toggle (Mobile)
  const toggleButton = document.getElementById('mobile-search-toggle');
  const searchForm = document.getElementById('search-form');

  if (toggleButton && searchForm) {
    // Toggle the visibility of the search form
    toggleButton.addEventListener('click', function () {
      searchForm.classList.toggle('visible');
    });

    // Hide search form when submit button is clicked
    document.getElementById('submit-search-form').addEventListener('click', function () {
      if (window.innerWidth <= 768) { // Mobile screen size threshold
        searchForm.classList.remove('visible');
        toggleButton.style.display = 'none'; // Hide search button when showing results
      }
    });

    // Hide search form when notable burials button is clicked
    document.getElementById('show-notable-burials').addEventListener('click', function () {
      if (window.innerWidth <= 768) {
        searchForm.classList.remove('visible');
        toggleButton.style.display = 'none'; // Hide search button when showing results
      }
    });

    // Hide search form when a grave is clicked
    const graves = document.getElementsByClassName('grave');
    for (let grave of graves) {
      grave.addEventListener('click', function () {
        if (window.innerWidth <= 768) {
          searchForm.classList.remove('visible');
          toggleButton.style.display = 'none'; // Hide search button when showing results
        }
      });
    }

    // Handle hiding search results and showing search button again
    document.getElementById('person-hide').addEventListener('click', function () {
      if (window.innerWidth <= 768) {
        toggleButton.style.display = 'block'; // Show search button again
      }
    });

    document.getElementById('plot-hide').addEventListener('click', function () {
      if (window.innerWidth <= 768) {
        toggleButton.style.display = 'block'; // Show search button again
      }
    });
  }

  /*
  *
  * END MOBILE FUNCTIONALITY
  * 
  */

};

/**
 * This function loads a list of people that are buried in a specific lot.
 * It also is used to display notable burials such as Arthur Ashe and Martha Anderson.
 * To display notable burials, the plotInfo string is "Notable Burials".
 *
 * @param {string} plotInfo The plot number {section letter}{lot number} of the grave. EX: ("M11")
 */
function displayPlot(plotInfo) {
  // Finding the group of people to list.
  var people = [];

  // Handle Section D specific rows
  if (plotInfo.startsWith("D Row")) {
    // Remove the 'D' portion of the string to just get the Row Name
    var rowName = plotInfo.replace("D ", "");

    // Loop through all the people in the sheet
    for (var i = 0; i < sheetData.all.length; i++) {
      var person = sheetData.all[i];
      var personSection = person[SECTION];

      // Only check for records in section D
      if (personSection === "D") {
        var matchingRow = null;

        // Find row defn that matches the given row name
        for (var j = 0; j < SECTION_D_ROWS.length; j++) {
          if (SECTION_D_ROWS[j].name === rowName) {
            matchingRow = SECTION_D_ROWS[j];
            break;
          }
        }

        // If a matching row is actually found in SECTION_D_Rows, proceed
        if (matchingRow) {
          var personGrave = person[GRAVE_NUMBER];

          // Check if person's grave num is in the list
          if (matchingRow.values) {
            var graveIsInList = matchingRow.values.includes(personGrave);

            // Add the person to the result
            if (graveIsInList) {
              people.push(person);
            }
          } else {
            // else applies to row using a numeric range (min and max), not a specific list

            // Check if grave is part of row X (which we want to exclude due to duplication)
            var isInRowX = false;

            for (var k = 0; k < SECTION_D_ROWS.length; k++) {
              var row = SECTION_D_ROWS[k];

              // If it is row X and has the current grave number, mark it
              if (row.name === "RowX" && row.values.includes(personGrave)) {
                isInRowX = true;
                break;
              }
            }

            // If its not a row X grave, check if it is within the current row RANGE
            if (!isInRowX) {
              var graveNumber = parseInt(personGrave);
              var isInRange = graveNumber >= matchingRow.min && graveNumber <= matchingRow.max;

              if (isInRange) {
                people.push(person); // Add person to result
              }
            }
          }
        }
      }
    }
  } else if (plotInfo == "Notable Burials") {
    people = sheetData.notable;
  }
  else if (plotInfo == "MHillside") {
    // Section "M" and lot number "Hillside"
    sheetData.all.forEach((person) => {
      if (person[SECTION] == "M" && person[LOT_NUMBER] == "Hillside")
        people.push(person);
    });
  } else if (plotInfo.startsWith("ZZ Section")) {
    // Get section number (1, 2, or 3) from the plotInfo string
    const sectionNum = plotInfo.replace("ZZ Section", "").trim();

    // Find the matching section configuration in SECTION_ZZ_ROWS
    const matchingSection = SECTION_ZZ_ROWS.find(section =>
      section.name === `ZZ Section${sectionNum}`
    );

    if (matchingSection) {
      // Filter all people in ZZ section that have a Find-A-Grave ID matching the IDs in this section
      for (let person of sheetData.all) {
        if (person[SECTION] === "ZZ") {
          const findAGraveId = person[FIND_A_GRAVE_ID];

          // Only include people whose Find-A-Grave ID is in this section's ID list
          if (matchingSection.ids.includes(findAGraveId)) {
            people.push(person);
          }
        }
      }
    }

    // ACCOUNTING FOR SINGLE GRAVE AREAS ENDS HERE

  } else {
    sheetData.all.forEach((person) => {
      if (plotInfo == `${person[SECTION]}${person[LOT_NUMBER]}`)
        people.push(person);
    });
  }

  // Hides the individual person container.
  document.getElementById("person-data").style.display = "none";

  // Displays a plot info div and adds a caption.
  document.getElementById("plot-data").style.display = "block";
  document.getElementById("plot-name").innerText = plotInfo;

  // Clearing the list of people and adjusting the CSS.
  let inhabitants = document.getElementById("plot-inhabitants");
  inhabitants.innerHTML = "";
  inhabitants.style.height = "auto";

  // Add additional 'info messages' for approximated areas
  if (SINGLE_GRAVES.some(entry => plotInfo.startsWith(entry))) {
    let message = document.createElement("p");
    message.innerHTML = `<strong>${plotInfo}</strong> - Contains ${people.length} burial records`;
    inhabitants.prepend(message);

    // Sort Entries by grave number
    people.sort((a, b) => parseInt(a[GRAVE_NUMBER]) - parseInt(b[GRAVE_NUMBER]));
  }

  for (let person of people) {
    // Creating the li element for each person
    let inhabitant = document.createElement("li");
    inhabitant.classList.add("plot-inhabitant");

    // Checks if plot is a single grave area and uses lot number or grave number accordingly
    if (SINGLE_GRAVES.includes(person[SECTION])) {
      // Special case for ZZ section
      if (person[SECTION] === "ZZ") {
        inhabitant.innerText = `${person[FIRST_NAME]} ${person[MIDDLE_NAME]} ${person[LAST_NAME]} (ZZ)`;
      } else {
        inhabitant.innerText = `${person[FIRST_NAME]} ${person[MIDDLE_NAME]} ${person[LAST_NAME]} (${person[SECTION]} ${person[GRAVE_NUMBER]})`;
      }
    } else {
      inhabitant.innerText = `${person[FIRST_NAME]} ${person[MIDDLE_NAME]} ${person[LAST_NAME]} (${person[SECTION]} ${person[LOT_NUMBER]})`;
    }

    // Removing double spaces from the innerText.
    inhabitant.innerText = inhabitant.innerText.replace(/  +/g, " ");

    // Adding click events
    inhabitant.onclick = () => {
      displayPerson(inhabitant.innerText);
    };

    // Adding the inhabitant to the inhabitants list.
    inhabitants.appendChild(inhabitant);
  }

  // Adding a scroll bar if necessary
  if (inhabitants.style.height > window.innerHeight - 220) {
    inhabitants.style.overflowY = "scroll";
    inhabitants.style.height = window.innerHeight - 220;
  } else {
    inhabitants.style.overflowY = "hidden";
    inhabitants.style.height = "auto";
  }
}

function displayPerson(personInfo) {
  // Showing the person data container
  document.getElementById("person-data").style.display = "block";

  // Hiding the plot data container
  document.getElementById("plot-data").style.display = "none";

  // Creating a list of people that match the description.
  let matches = [];

  // Clean up the search input: remove extra spaces and periods
  let searchInput = personInfo
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/\./g, "")
    .trim();

  // Searching all data.
  for (let entry of sheetData.all) {
    // Create different versions of the name for matching
    let fullName =
      `${entry[FIRST_NAME]} ${entry[MIDDLE_NAME]} ${entry[LAST_NAME]}`
        .toLowerCase()
        .replace(/\s+/g, " ")
        .replace(/\./g, "")
        .trim();
    let shortName = `${entry[FIRST_NAME]} ${entry[LAST_NAME]}`
      .toLowerCase()
      .trim();

    // For Single graves sections, use GRAVE_NUMBER instead of LOT_NUMBER
    let location;
    if (SINGLE_GRAVES.includes(entry[SECTION])) {
      location = `${entry[SECTION]} ${entry[GRAVE_NUMBER]}`
        .toLowerCase()
        .trim();
    } else {
      // For all other sections, use LOT_NUMBER
      location = `${entry[SECTION]} ${entry[LOT_NUMBER]}`
        .toLowerCase()
        .trim();
    }

    // Create the full string with location
    let fullString = `${fullName} (${location})`;
    let shortString = `${shortName} (${location})`;

    // Check if EITHER version matches
    if (fullString.includes(searchInput) || shortString.includes(searchInput)) {
      matches.push(entry);
    }
  }

  // Showing the number of matches found
  document.getElementById("person-count").innerText = `${matches.length} match${matches.length == 1 ? "" : "es"
    } found`;

  // Clearing existing records
  var records = document.getElementById("person-records");
  records.innerHTML = "";

  // Showing matches found
  for (let match of matches) {
    let div = document.createElement("div");
    div.classList.add("person-record");

    // Adding a border to separate this row from others.
    div.append(document.createElement("hr"));

    // Creating the name banner and adding it to the main div.
    let name = document.createElement("h2");
    name.classList.add("person-name");
    name.innerHTML = `${match[FIRST_NAME]} ${match[MIDDLE_NAME]} ${match[LAST_NAME]}`;
    div.append(name);

    // Creating the info div.
    // It contains all relevant information about the person.
    let info = document.createElement("div");
    info.classList.add("person-info");

    // Add the confirmed tag if it exists (used to tell the user if a grave in an approximated section is verified in person)
    if (match[CONFIRMED] === "C") {
      let confirmedTag = document.createElement("h4");
      confirmedTag.classList.add("confirmed-tag");
      confirmedTag.innerText = "CONFIRMED";
      info.append(confirmedTag);
    }

    // Creating the section element and adding it to the info div.
    let section = document.createElement("p");
    section.classList.add("person-section");
    section.innerText = `Section: ${match[SECTION]}`;
    info.append(section);

    // Creating the lotNumber element and adding it to the info div.
    let lotNumber = document.createElement("p");
    lotNumber.classList.add("person-lot-number");
    lotNumber.innerText = `Lot Number: ${match[LOT_NUMBER]}`;
    info.append(lotNumber);

    // Creating the title element and adding it to the info div.
    let title = document.createElement("p");
    title.classList.add("person-title");
    title.innerText = `Title: ${match[TITLE]}`;
    info.append(title);

    // Creating the graveNumber element and adding it to the info div.
    let graveNumber = document.createElement("p");
    graveNumber.classList.add("person-grave-number");
    graveNumber.innerText = `Grave Number: ${match[GRAVE_NUMBER]}`;
    info.append(graveNumber);

    // Creating the deathDate element and adding it to the info div.
    let deathDate = document.createElement("p");
    deathDate.classList.add("person-death-date");
    deathDate.innerText = `Death Date: ${match[DEATH_DATE] == "??-??-????" ? "Unknown" : match[DEATH_DATE]
      }`;
    info.append(deathDate);

    // Creating the burialDate element and adding it to the info div.
    let burialDate = document.createElement("p");
    burialDate.classList.add("person-burial-date");
    burialDate.innerText = `Burial Date: ${match[BURIAL_DATE] == "??-??-????" ? "Unknown" : match[BURIAL_DATE]
      }`;
    info.append(burialDate);

    // Creating the notes element and adding it to the info div.
    if (match[NOTES] != "") {
      let notes = document.createElement("p");
      notes.classList.add("person-notes");
      notes.innerText = `Notes: ${match[NOTES]}`;
      info.append(notes);
    }

    // Adding the info div to the main div.
    div.append(info);

    // Adding the Find-A-Grave link, if it exists, to the main div.
    if (match[FIND_A_GRAVE_ID] != "") {
      // Spacing the buttons from the rest of the text.
      div.append(document.createElement("br"));

      // Adding the find a grave button to the document.
      let findAGraveLink = document.createElement("input");
      findAGraveLink.type = "button";
      findAGraveLink.classList.add("find-a-grave-link");
      findAGraveLink.value = "FindAGrave.com";
      findAGraveLink.onclick = () => {
        window.open(
          `https://findagrave.com/memorial/${match[FIND_A_GRAVE_ID]}`,
          "_blank"
        );
      };

      div.append(findAGraveLink);
    }

    // Adding the sketchfab button, if it exists, to the main div.
    if (match[SKETCHFAB_ID] != "") {
      // Separating the Find-A-Grave and sketchfab buttons
      // div.append(document.createElement("br"));

      // Adding the sketchfab button.
      let sketchfabView = document.createElement("input");
      sketchfabView.type = "button";
      sketchfabView.classList.add("sketchfab-view");
      sketchfabView.value = "View 3D Grave";
      sketchfabView.onclick = () => {
        displaySketchFab(match);
      };

      div.append(sketchfabView);
    }

    // The div is now complete, adding it to the page.
    records.append(div);

    // Determine the highlight class based on the person's location
    let objClass;

    const sect = match[SECTION];
    const lot = match[LOT_NUMBER];
    const grave = match[GRAVE_NUMBER];

    // Handle single-grave sections (like D, MHillside)
    if (SINGLE_GRAVES.includes(sect)) {
      if (sect === "D") {
        // Check if it's in RowX
        const isRowXGrave = SECTION_D_ROWS.find(function (row) {
          return row.name === "RowX" && row.values.includes(grave);
        });

        if (isRowXGrave) {
          objClass = "D RowX";
        } else {
          // If not rowX check which row it belongs to via the numerical ranges
          const graveNum = parseInt(grave);
          const rowDef = SECTION_D_ROWS.find(function (row) {
            if (row.name === "RowX") {
              return false;
            }
            return graveNum >= row.min && graveNum <= row.max;
          });

          // If there is a definition for a row available then set the class to highlight it
          if (rowDef) {
            objClass = `D ${rowDef.name}`;
          }
        }
      } else if (sect === "MHillside") {
        objClass = "MHillside";
      } else if (sect === "ZZ") {
        // Look for the section containing this person's Find A Grave ID
        const findAGraveId = match[FIND_A_GRAVE_ID];
        const rowDef = SECTION_ZZ_ROWS.find(function (row) {
          return row.ids.includes(findAGraveId);
        });

        if (rowDef) {
          objClass = `ZZ ${rowDef.name}`;
        }
      }
    } else {
      // For regular sections (like B3, D34 etc.)
      objClass = `${sect}${lot}`;
    }

    // If elements are found, make them visible (opacity = 1)
    if (objClass) {
      const selector = `.${objClass.replace(/\s+/g, ".")}`;
      const elements = document.querySelectorAll(selector);

      // Ensure we don't need to handle graves separately
      if (elements.length > 0) {
        elements.forEach(element => {
          element.style.opacity = "1";
        });
      }
    }

    // Hiding action for the person data and highlights
    document.getElementById("person-hide").onclick = function () {
      // Hide person data section
      document.getElementById("person-data").style.display = "none";

      // Clear all grave highlights
      document.querySelectorAll(".grave").forEach(grave => {
        grave.style.opacity = 0;
      });

      // Clear section row highlights (like D RowX, Section2, etc.)
      SINGLE_GRAVES.forEach(function (sectionPrefix) {
        document.querySelectorAll(`[class^="${sectionPrefix} "]`).forEach(row => {
          row.style.opacity = 0;
        });
      });
    }
  }
}

function getPersonMatches(info) {
  // A list of people that have data matching the info parameter.
  let matches = [];

  // Searching all data.
  for (let entry of sheetData.all) {
    // Checking the first name, middle name, last name, section, and lot numbers
    if (
      (info[0] == "" ||
        entry[FIRST_NAME].toLowerCase() == info[0].toLowerCase()) &&
      (info[1] == "" ||
        entry[MIDDLE_NAME].toLowerCase() == info[1].toLowerCase()) &&
      (info[2] == "" ||
        entry[LAST_NAME].toLowerCase() == info[2].toLowerCase()) &&
      (info[3] == "" ||
        entry[SECTION].toLowerCase() == info[3].toLowerCase()) &&
      (info[4] == "" ||
        entry[LOT_NUMBER].toLowerCase() == info[4].toLowerCase())
    ) {
      matches.push(entry);
    }
  }

  // Returning the matches.
  return matches;
}

function displaySketchFab(person) {
  // Showing the sketchfab container.
  document.getElementById("sketchfab-container").style.display = "block";

  // Adding a title and source for the embed.
  document.getElementById(
    "sketchfab-title"
  ).innerText = `${person[FIRST_NAME]} ${person[LAST_NAME]}'s Gravestone`;
  document.getElementById(
    "sketchfab-embed"
  ).src = `https://sketchfab.com/models/${person[SKETCHFAB_ID]}/embed`;
}

/**
 * Returns a JSON of the values on the spreadsheet linked below.
 * It uses the "sheetName" parameter to determine which sheet to get the information from.
 * https://docs.google.com/spreadsheets/d/1oB7kgRwhQm-dYftSOGRPD0xIaAJzecGpxFUHgBup80I/edit
 */
async function getInfo(sheetName) {
  return await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(
      sheetName
    )}?key=${API_KEY}`
  )
    .then((resp) => resp.json())
    .then((json) => {
      for (let i = 0; i < json.values.length; i++) {
        for (let j = 0; j < 14; j++) {
          json.values[i][j] =
            json.values[i][j] == undefined ? "" : json.values[i][j].trim();
        }
      }

      if (sheetName == "All SGA") {
      }

      return json.values;
    });
}
