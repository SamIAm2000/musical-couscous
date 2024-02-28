document.addEventListener('DOMContentLoaded', function () {
    // Function to handle animation end event
    function handleAnimationEnd(event) {
      // Remove the animation class from the element when the animation ends
      event.target.classList.remove('animate');
    }
  
    // Function to handle button click
    function handleButtonClick() {
      var pot = document.getElementById('pot');
      
      // Create a clone of the pot element
      var potClone = pot.cloneNode(true);
      
      // Append the clone to the container
      pot.parentNode.appendChild(potClone);
      
      // Add the animation class to the clone to start the animation
      potClone.classList.add('animate');
      
      // Add event listener to detect animation end for the clone
      potClone.addEventListener('animationend', handleAnimationEnd, { once: true });
    }
  
    // Add event listener to button click
    document.getElementById('startButton').addEventListener('click', handleButtonClick);
  });
  