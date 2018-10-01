/**
 * Carousa11y
 * Author: James Catt
 * License: ?
 */

class Carousa11y {
    /**
     * @constructor
     * @param {HTMLElement} carouselRoot - Root/wrapper HTML element for the carousel
     * @param {Array.<HTMLElement>} carouselSlides - The slides for inclusion in the carousel
     * @param {(boolean|Object)} autoCreateControls - Setting false suppresses creation of any controls. Object allows suppression of specific control elements
     * @param {boolean} autoCreateControls.announceElement - Set false to suppress creation of an aria-live region for announcing the current slide.
     * @param {boolean} autoCreateControls.prevButton - Set false to suppress creation of a 'previous slide' button.
     * @param {boolean} autoCreateControls.nextButton - Set false to suppress creation of a 'next slide' button.
     * @param {boolean} autoCreateControls.playStopButton - Set false to suppress creation of a play/stop toggle button.
     * @param {boolean} autoCreateControls.slideButtons - Set false to suppress creation of a list of buttons for selecting a specific slide.
     */
    constructor(carouselRoot, carouselSlides, autoCreateControls) {

        // validate carouselRoot
        if (!carouselRoot instanceof HTMLElement) {
            throw new Error('carouselRoot must be an HTMLElement.');
        }

        // validate carouselSlides
        if (!carouselSlides instanceof Array) {
            throw new Error('carouselSlides must be an array.');
        }

        carouselSlides.forEach(slide => {

            if (!slide instanceof HTMLElement) {
                throw new Error(`carouselSlides array must contain only HTMLElements. carouselSlides[${index}] failed this test.`);
            }

        });

    }

}

export default Carousa11y;