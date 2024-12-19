document.addEventListener("DOMContentLoaded", () => {
    // Detect touch devices
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (isTouchDevice) {
        const cards = document.querySelectorAll('.card');

        let activeCard = null; // Track the currently active card

        // Function to activate hover effect on a card
        const activateCard = (card) => {
            if (activeCard) {
                activeCard.classList.remove('active'); // Remove the effect from the previously active card
            }
            card.classList.add('active'); // Add the effect to the clicked card
            activeCard = card; // Update the active card
        };

        // Attach click event listeners to all cards
        cards.forEach((card) => {
            card.addEventListener('click', () => {
                activateCard(card);
            });
        });
    }
});
