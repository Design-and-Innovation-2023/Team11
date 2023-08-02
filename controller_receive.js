//create an instance of NesSmartController, optionally specify a peer ID for the PC browser peer
//firstconnected is true by default, only the first player to connect to a specific player ID will be allowed to keep it, the rest of the connections to the same ID won't be allowed
const container = document.querySelector(".container");
let inVideo = false;
let previousSelectedDiv; // Variable to keep track of the selected div
let newAHrefTag;
let selectedRow = 1;
let selectedCol = 1;
let simplePeer;
const temp = window.location.pathname;



if (temp.split("/")[temp.split("/").length - 1] === "index.html") {
  const simplePeerData = JSON.parse(sessionStorage.getItem("smartControllerInstance"));
  if (!simplePeerData) {
    //create and display a QR code for the smartphones, specify url for the controller, div element for the code to be displayed,
    //optionally size and a player ID, in this case the player ID is set to 1
    //the url is an official Nes Controller compatible with the NesSmartController class
    simplePeer = new smartcontroller.NesSmartController();

    simplePeer.createQrCode(
      "https://smartcontrollerjs.github.io/Controllers/nesController.html",
      "qrcode",
      150,
      150,
      "1"
    );

    // Save the connection data in sessionStorage
    simplePeer.on("connection", function (data) {
      console.log(data)
      const connectionData = {
        peerId: data.provider._id,
        controllerId: data.peer // Assuming you have a property called 'signalingData' in the 'data' object
      };
      sessionStorage.setItem("connectionData", JSON.stringify(connectionData));
    });
  } else {
    console.log("attemping to retrieve old connections")
    const savedConnectionData = JSON.parse(sessionStorage.getItem("connectionData"));
    if (savedConnectionData) {
      const {
        peerId,
        signalingData
      } = savedConnectionData;

      // Reuse the connection with the saved data
      simplePeer = new smartcontroller.NesSmartController(peerId);
    }
  }
} else {
  // Retrieve the instance of simplePeer from sessionStorage
  console.log("attemping to retrieve old connections")
  const savedConnectionData = JSON.parse(sessionStorage.getItem("connectionData"));
  // Reuse the connection with the saved data
  const peerid = savedConnectionData.peerId;
  const controllerid = savedConnectionData.controllerId;
  console.log("reusing old connection:" + peerid);
  // Connect the new peer ID to the existing controller ID
  simplePeer = new smartcontroller.NesSmartController({ peerid: peerid });
  simplePeer.connectToPeer(controllerid);
}


processData();

function findFirstItemInRow(selectedRow, divArray) {
  if (!divArray[selectedRow]) {
    return null; // Return null if the selected row doesn't exist in the 2D matrix
  }

  for (const element of divArray[selectedRow]) {
    const item = element;
    if (item) {
      // If the item in the column is not null, return it
      return item;
    }
  }

  return null; // Return null if no item with a value is found in the row
}

function findClassNameOfDivElement(divElement) {
  if (divElement instanceof HTMLDivElement) {
    return divElement.className;
  } else {
    return null; // Return null if the provided element is not an HTMLDivElement
  }
}

function findAHrefTag(divElement) {
  // Check if there is an 'a' tag inside the 'myDiv'
  const myLink = divElement.querySelector("a");

  if (myLink) {
    console.log(myLink)
    // If 'myLink' is found, get its 'id' attribute
    const linkId = myLink.id;
    if (linkId) {
      console.log("link found: " + linkId);
      return linkId;
    } else {
      // If 'id' attribute is not found, get the 'href' attribute
      const href = myLink.getAttribute('href');
      console.log("href found: " + href);
      return href;
    }
  } else {
    console.log("No 'a' tag found inside 'myDiv'.");
    return null;
  }
}

// Function to simulate the hover effect
function simulateHoverEffect(targetDiv) {
  targetDiv.classList.add("myDivHovered");

  // Remove the hover effect after a short delay (500ms)
  setTimeout(() => {
    targetDiv.classList.remove("myDivHovered");
  }, 500);
}

function resetAllDivBorders() {
  const allClickableDivs = document.querySelectorAll(
    '[class^="clickableDiv-"]'
  );
  allClickableDivs.forEach((div) => {
    div.style.border = "none";
  });
}

function mapClickableDivs() {
  const divArray = [];
  const clickableDivs = document.querySelectorAll('[class^="clickableDiv-"]');
  clickableDivs.forEach((div) => {
    const className = div.className;
    const card = parseInt(className.split("-")[1]);
    const row = parseInt(className.split("-")[2]);
    const col = parseInt(className.split("-")[3]);
    if (!divArray[row]) {
      divArray[row] = [];
    }
    divArray[row][col] = div;
  });

  // Fill in any missing columns with null
  for (let row = 1; row < divArray.length; row++) {
    if (!divArray[row]) {
      divArray[row] = [];
    }
  }
  return divArray;
}

function simulateButtonClick(buttonTitleToClick) {
  // Find the button element based on its title
  const buttons = document.querySelectorAll('button'); // Or use any other attribute to select the button
  let buttonToClick;

  buttons.forEach(button => {
    if (button.title === buttonTitleToClick) {
      buttonToClick = button;
    }
  });

  // If the button is found, simulate the click event
  if (buttonToClick) {
    buttonToClick.click();
  }
}

// A function that checks if player 1 is connected, if yes then check the arrow keys to highlight the buttons
function processData() {
  const divArray = mapClickableDivs();
  const container = document.querySelector(".container");
  const emptyBorder = "none"; // Original border size
  const originalBorderSize = "2px solid blue"; // Original border size
  const enlargedBorderSize = "4px solid blue"; // Enlarged border size
  const currentPage = window.location.pathname; // Check the current HTML page

  if (!previousSelectedDiv) {
    previousSelectedDiv = divArray[1][1];
  }

  if (simplePeer.controllerList[1]) {
    // Store the controller to access its fields, the dictionary key is 1 because a player ID has been specified, otherwise the peer ID from smartphone will be used
    var controller = simplePeer.controllerList[1];
    var button_id = ["up", "down", "left", "right", "a", "b"];

    for (var id of button_id) {
      if (controller.buttons[id]) {
        console.log(controller.buttons[id]);
        // Restore the border of the previously selected div
        if (
          (id === "up" && selectedRow === 1) ||
          (id === "down" && selectedRow === divArray.length - 1)
        ) {
          return;
        } else if (id === "up") {
          console.log("Up arrow key pressed.");
          selectedRow -= 1;
        } else if (id === "down") {
          console.log("Down arrow key pressed.");
          selectedRow += 1;
        } else if (id === "left") {
          console.log("Left arrow key pressed.");
          selectedCol -= 1;
        } else if (id === "right") {
          console.log("Right arrow key pressed.");
          selectedCol += 1;
        } else if (id === "a" && newAHrefTag) {
          console.log("Entering..." + newAHrefTag);
          // Trigger a click event on the targeted a element
          // Check if href starts with './'
          if (newAHrefTag.startsWith('./')) {
            inVideo = false
            window.location.assign(newAHrefTag);
          }
          const linkObject = document.getElementById(newAHrefTag);
          linkObject.click();
          inVideo = true;
        } else if (id === "b" && newAHrefTag && inVideo) {
          simulateButtonClick("Close (Esc)");
          inVideo = false;
        } else if (id === "b" && !inVideo) {
          console.log("backing")
          history.back();
        }
        // Attempt to get the new selected div
        let newSelectedDiv = divArray[selectedRow][selectedCol];
        if (
          !newSelectedDiv &&
          (id === "up" || id === "down")
        ) {
          newSelectedDiv = findFirstItemInRow(selectedRow, divArray);
          const className = findClassNameOfDivElement(newSelectedDiv);
          selectedRow = parseInt(className.split("-")[2]);
          selectedCol = parseInt(className.split("-")[3]);
        }
        console.log(selectedRow + " " + selectedCol);

        // Enlarge the border for a short duration when navigating out of bounds
        if (
          !newSelectedDiv ||
          typeof newSelectedDiv === "undefined" ||
          newSelectedDiv === null
        ) {
          // If the new selected div doesn't exist, restore the border of the previously selected div
          if (previousSelectedDiv) {
            previousSelectedDiv.classList.add("selected");
            previousSelectedDiv.style.border = enlargedBorderSize;
          }
          if (id === "up") {
            console.log("Up arrow key pressed.");
            selectedRow += 1;
          } else if (id === "down") {
            console.log("Down arrow key pressed.");
            selectedRow -= 1;
          } else if (id === "left") {
            console.log("Left arrow key pressed.");
            selectedCol += 1;
          } else if (id === "right") {
            console.log("Right arrow key pressed.");
            selectedCol -= 1;
          }
          console.log("doing nothing");
          return; // Do nothing if the selectedDiv is undefined (out of bounds)
        }

        previousSelectedDiv.classList.remove("selected");
        previousSelectedDiv.style.border = emptyBorder;
        // Set the new selected div as the current selected div
        newSelectedDiv.classList.add("selected");
        newSelectedDiv.style.border = enlargedBorderSize;

        previousSelectedDiv.classList.remove("selected");
        // Store the current selected div as the previously selected div
        previousSelectedDiv = newSelectedDiv;
        newAHrefTag = findAHrefTag(newSelectedDiv)
        if (currentPage === "/team.html" && selectedRow === 1 && selectedCol === 1) {
          // Scroll to the top of the page
          requestAnimationFrame(() => {
            document.documentElement.scrollIntoView({
              behavior: "smooth"
            });
          });
        } else {
          // Use requestAnimationFrame to scroll smoothly to the new selected div
          requestAnimationFrame(() => {
            newSelectedDiv.scrollIntoView({
              behavior: "smooth"
            });
          });
        }
        setTimeout(() => {
          // After a short delay, reset the border to its original size
          newSelectedDiv.style.border = originalBorderSize;
        }, 50); // Adjust the delay duration (in milliseconds) as needed
      }
    }
  }
  setTimeout(processData, 200); // 1000 milliseconds = 1 second
}

























document.addEventListener("keydown", function (event) {
  const divArray = mapClickableDivs();
  const container = document.querySelector(".container");
  const emptyBorder = "none"; // Original border size
  const originalBorderSize = "2px solid blue"; // Original border size
  const enlargedBorderSize = "4px solid blue"; // Enlarged border size
  const currentPage = window.location.pathname; // Check the current HTML page

  if (!previousSelectedDiv) {
    previousSelectedDiv = divArray[1][1];
  }

  if (
    (event.key === "ArrowUp" && selectedRow === 1) ||
    (event.key === "ArrowDown" && selectedRow === divArray.length - 1)
  ) {
    return;
  } else if (event.key === "ArrowUp") {
    console.log("Up arrow key pressed.");
    selectedRow -= 1;
  } else if (event.key === "ArrowDown") {
    console.log("Down arrow key pressed.");
    selectedRow += 1;
  } else if (event.key === "ArrowLeft") {
    console.log("Left arrow key pressed.");
    selectedCol -= 1;
  } else if (event.key === "ArrowRight") {
    console.log("Right arrow key pressed.");
    selectedCol += 1;
  } else if (event.key === "Enter" && newAHrefTag) {
    console.log("Entering..." + newAHrefTag);
    event.preventDefault(); // Prevent default Enter behavior (e.g., form submission)
    // Trigger a click event on the targeted a element
    // Check if href starts with './'
    if (newAHrefTag.startsWith('./')) {
      window.location.assign(newAHrefTag);
    }
    const linkObject = document.getElementById(newAHrefTag);
    linkObject.click();
  } else if (event.key === "Enter" && !newAHrefTag) {
    console.log("No ahref tag to enter")
  }
  // Attempt to get the new selected div
  let newSelectedDiv = divArray[selectedRow][selectedCol];
  if (
    !newSelectedDiv &&
    (event.key === "ArrowUp" || event.key === "ArrowDown")
  ) {
    newSelectedDiv = findFirstItemInRow(selectedRow, divArray);
    const className = findClassNameOfDivElement(newSelectedDiv);
    selectedRow = parseInt(className.split("-")[2]);
    selectedCol = parseInt(className.split("-")[3]);
  }

  // Enlarge the border for a short duration when navigating out of bounds
  if (
    !newSelectedDiv ||
    typeof newSelectedDiv === "undefined" ||
    newSelectedDiv === null
  ) {
    // If the new selected div doesn't exist, restore the border of the previously selected div
    if (previousSelectedDiv) {
      previousSelectedDiv.classList.add("selected");
      previousSelectedDiv.style.border = enlargedBorderSize;
    }
    if (event.key === "ArrowUp") {
      console.log("Up arrow key pressed.");
      selectedRow += 1;
    } else if (event.key === "ArrowDown") {
      console.log("Down arrow key pressed.");
      selectedRow -= 1;
    } else if (event.key === "ArrowLeft") {
      console.log("Left arrow key pressed.");
      selectedCol += 1;
    } else if (event.key === "ArrowRight") {
      console.log("Right arrow key pressed.");
      selectedCol -= 1;
    }
    console.log("doing nothing");
    return; // Do nothing if the selectedDiv is undefined (out of bounds)
  }

  previousSelectedDiv.classList.remove("selected");
  previousSelectedDiv.style.border = emptyBorder;
  // Set the new selected div as the current selected div
  newSelectedDiv.classList.add("selected");
  newSelectedDiv.style.border = enlargedBorderSize;

  previousSelectedDiv.classList.remove("selected");
  // Store the current selected div as the previously selected div
  previousSelectedDiv = newSelectedDiv;
  newAHrefTag = findAHrefTag(newSelectedDiv)
  console.log("current div: " + findClassNameOfDivElement(newSelectedDiv))
  console.log(selectedRow + " " + selectedCol + " " + newAHrefTag)
  if (currentPage.split("/")[currentPage.split("/").length - 1] === "team.html" && selectedRow === 1 && selectedCol === 1) {
    // Scroll to the top of the page
    requestAnimationFrame(() => {
      document.documentElement.scrollIntoView({
        behavior: "smooth"
      });
    });
  } else {
    // Use requestAnimationFrame to scroll smoothly to the new selected div
    requestAnimationFrame(() => {
      newSelectedDiv.scrollIntoView({
        behavior: "smooth"
      });
    });
  }

  newSelectedDiv.scrollIntoView({
    behavior: "smooth"
  });
  setTimeout(() => {
    // After a short delay, reset the border to its original size
    newSelectedDiv.style.border = originalBorderSize;
  }, 200); // Adjust the delay duration (in milliseconds) as needed
});