/**
 * Carousa11y
 * Author: James Catt
 * License: ?
 */

import './carousa11y.scss';

export default class Carousa11y {
    
    /**
     * @constructor
     * @param {HTMLElement} carouselRoot - Root/wrapper HTML element for the carousel
     * @param {Array.<HTMLElement>} carouselSlides - The slides for inclusion in the carousel
     * @param {Object} options - Options container
     * @param {Number} options.autoAdvanceTime - Number of milliseconds to wait between auto-advancing to next slide. Set 0 to disable auto-advance.
     * @param {Number} options.transitionTime - Number of milliseconds to allow for CSS transitions between slides.
     * @param {(boolean|Object)} options.autoCreateControls - Setting false suppresses creation of any controls. Object allows suppression of specific control elements
     * @param {boolean} options.autoCreateControls.announceElement - Set false to suppress creation of an aria-live region for announcing the current slide.
     * @param {boolean} options.autoCreateControls.prevNextButtons - Set false to suppress creation of 'previous slide' and 'next slide' controls.
     * @param {boolean} options.autoCreateControls.playStopButton - Set false to suppress creation of a play/stop toggle button.
     * @param {boolean} options.autoCreateControls.slideButtons - Set false to suppress creation of a list of buttons for selecting a specific slide.
     */
    constructor(

        carouselRoot,
        carouselSlides,
        { // default options
            autoAdvanceTime = 5000,
            transitionTime = 300,
            autoCreateControls = {},
        } = {}

    ) {

        // validate carouselRoot
        if (carouselRoot instanceof HTMLElement !== true) {
            throw new Error('carouselRoot must be an HTMLElement.');
        }

        // validate carouselSlides
        if (carouselSlides instanceof Array !== true || carouselSlides.length < 2) {
            throw new Error('carouselSlides must be an array with at least 2 HTMLElements.');
        }

        carouselSlides.forEach(slide => {

            if (slide instanceof HTMLElement !== true) {
                throw new Error(`carouselSlides array must contain only HTMLElements. carouselSlides[${index}] failed this test.`);
            }

        });

        // validation tests passed, proceed with instantiation
        this.carouselRoot = carouselRoot;
        this.carouselSlides = carouselSlides;
        this.autoCreateControls = autoCreateControls;
        this.autoAdvanceTime = autoAdvanceTime; // note that validity checking of autoAdvanceTime value will be handled by the autoAdvanceTime setter method
        this.transitionTime = transitionTime; // note that validity checking of transitionTime value will be handled by the transitionTime setter method

        // Private properties
        this._playing = this.autoAdvanceTime !== 0;
        this._currentSlideIndex = 0;
        this._autoAdvanceTimer;

        // Set appropriate starting CSS classes on slides
        this.carouselSlides[this.currentSlideIndex].classList.add('s-carousa11y__slide--current');
        this.carouselSlides[this.nextSlideIndex].classList.add('s-carousa11y__slide--next');
        this.carouselSlides[this.previousSlideIndex].classList.add('s-carousa11y__slide--previous');

        // insert default controls as appropriate
        if (this.autoCreateControls.announceElement !== false) {
            this.carouselRoot.appendChild(this._createAnnounceElement());
        }

        if (this.autoCreateControls.prevNextButtons !== false) {
            this.carouselRoot.appendChild(this._createPrevNextControls());
            this.carouselRoot.querySelector('#carousa11yNextButton').addEventListener('click', () => {
                this.goToNextSlide();
                this.stop();
            });
            this.carouselRoot.querySelector('#carousa11yPrevButton').addEventListener('click', () => {
                this.goToPreviousSlide();
                this.stop();
            });
        }

        if (this.autoCreateControls.playStopButton !== false) {
            this.carouselRoot.appendChild(this._createPlayStopButton(this._playing));
            this.carouselRoot.querySelector('#carousa11yPlayStopButton').addEventListener('click', () => {this.togglePlay();});
        }

        if (this.autoCreateControls.slideButtons !== false) {
            this.carouselRoot.appendChild(this._createGoToSlideControls(this.carouselSlides.length));
            const slideButtons = Array.from(document.getElementsByClassName('c-carousa11y__button--go-to-slide'));
            slideButtons.forEach(slideButton => {
                slideButton.addEventListener('click', e => {
                    this.goToSlide(e.currentTarget.dataset.slideButton, true);
                    this.stop();
                });
            });
            this._setCurrentControl(this._currentSlideIndex);
        }

        // kick-off
        if (this._playing) {
            this._autoAdvance();
        }

    }

    /**
     * Go to the next slide
     */
    goToNextSlide() {
        this._goToSlide(this.nextSlideIndex, false, true);
    }

    /**
     * Go to the previous slide
     */
    goToPreviousSlide() {
        this._goToSlide(this.previousSlideIndex, false, false);
    }

    /**
     * Go to a specific slide
     * @param {Number} slideNumber - Number of the slide to go to, not zero-indexed (i.e., first slide === 1).
     */
    goToSlide(slideNumber, setFocus, directionIsForwards) {
        this._goToSlide(slideNumber - 1, setFocus, directionIsForwards);
    }

    /**
     * Start auto-advance the carousel. If the autoAdvance timeout setting === 0, just move it forward once.
     */
    play() {

        if (this.autoAdvanceTime !== 0) {

            this._playing = true;
            this._autoAdvance();

        }

        this.goToNextSlide();

        // TODO: dispatch event

    }

    /**
     * Stop auto-advancing the carousel
     */
    stop() {

        this._playing = false;
        this._setPlayStopButtonState();
        clearInterval(this._autoAdvanceTimer);

        // TODO: dispatch event

    }

    /**
     * Toggles current play state on or off
     */
    togglePlay() {

        if (this._playing) {

            this.stop();

        } else {

            this.play();

        }
        
    }

    /**
     * Get the non-zero-indexed number of the currently-displayed slide
     * @return {number} - non zero-indexed number of the currently-displayed slide
     */
    get currentSlide() {
        return this._currentSlideIndex + 1;
    }

    /**
     * Prevents setting of the current slide directly
     */
    set currentSlide(slideNumber) {
        throw new Error('currentSlide cannot be set directly. Use goToSlide(slideNumber) instead.');
    }

    /**
     * Get the zero-indexed number for the current slide
     * @return {number}
     */
    get currentSlideIndex() {
        return this._currentSlideIndex;
    }

    /**
     * Get the zero-indexed number of the next slide from the current one
     * @return {number}
     */
    get nextSlideIndex() {
        
        if (this.currentSlideIndex < this.carouselSlides.length - 1) {
            return this.currentSlideIndex + 1;
        } else {
            return 0;
        }

    }

    /**
     * Get the zero-indexed number of the previous slide from the current one
     * @return {number}
     */
    get previousSlideIndex() {
        
        if (this.currentSlideIndex === 0) {
            return this.carouselSlides.length - 1;
        } else {
            return this.currentSlideIndex - 1;
        }

    }

    /**
     * Set the auto-advance timer
     * @param {number} duration - number of milliseconds before auto-advancing to the next slide
     */
    set autoAdvanceTime(duration) {
        if (typeof duration !== 'number') {
            throw new Error('autoAdvanceTime must be set to an number (milliseconds).');
        }
        this._autoAdvanceTime = duration;
    }

    /**
     * Get the current auto-advance timer
     * @returns {number}
     */
    get autoAdvanceTime() {
        return this._autoAdvanceTime;
    }

    /**
     * @param {number} duration - number of milliseconds to allow for CSS transitions between slides
     */
    set transitionTime(duration) {
        if (typeof duration !== 'number') {
            throw new Error('transitionTime must be set to an number (milliseconds).');
        }
        this._transitionTime = duration;        
    }

    /**
     * Get the current slide transition time
     * @returns {number}
     */
    get transitionTime() {
        return this._transitionTime;
    }

    // Private methods
    /**
     * 
     */
    _autoAdvance() {

        if (this.autoAdvanceTime <= 0) {
            throw new Error('_autoAdvance was called with timeout <= 0');
        }

        this._playing = true;
        clearInterval(this._autoAdvanceTimer);
        this._autoAdvanceTimer = setInterval(() => {this.goToNextSlide();}, this.autoAdvanceTime);
        this._setPlayStopButtonState();

        // TODO: dispatch event

    }

    /**
     * Function to update the announce element for screen readers.
     * @param {string} message - Message to be inserted into the announce element 
     */
    _setAnnounceMessage(message) {

        if (typeof message !== 'string') {
            throw new Error('_announceMessage must be called with a string.');
        }

        if (this.autoCreateControls.announceElement !== false) {
            this.carouselRoot.querySelector('#carousa11yAnnounceElement').innerHTML = message;
        }

    }

    _setPlayStopButtonState() {

        if (this.autoCreateControls.playStopButton === false) {
            return;
        }

        let playStopButton = this.carouselRoot.querySelector('#carousa11yPlayStopButton');

        if (this._playing) {

            playStopButton.setAttribute('aria-pressed', 'true');
            playStopButton.classList.remove('s-carousa11y__button--stopped');
            playStopButton.classList.add('s-carousa11y__button--playing');

        } else {

            playStopButton.setAttribute('aria-pressed', 'false');
            playStopButton.classList.remove('s-carousa11y__button--playing');
            playStopButton.classList.add('s-carousa11y__button--stopped');

        }

    }

    /**
     * 
     * @param {number} slideIndex - The zero-indexed number for the slide to advance to
     * @param {boolean} directionIsForwards - true if the carousel should behave as advancing in a forwards (i.e., rightward) direction, default is based on comparing the indices of the new slide and existing current slide
     */
    _goToSlide(slideIndex, setFocus = false, directionIsForwards = slideIndex > this.currentSlideIndex) {
        
        if (slideIndex >= this.carouselSlides.length || slideIndex < 0) {
            throw new Error(`invalid slide index: ${slideIndex}`);
        }

        if (slideIndex === this.currentSlideIndex) {
            return;
        }

        // set these before updating _currentSlideIndex
        const oldPreviousSlide = this.carouselSlides[this.previousSlideIndex];
        const oldNextSlide = this.carouselSlides[this.nextSlideIndex];
        const oldCurrentSlide = this.carouselSlides[this._currentSlideIndex]

        this._currentSlideIndex = slideIndex;

        const newCurrentSlide = this.carouselSlides[slideIndex];
        const newNextSlide = this.carouselSlides[this.nextSlideIndex];
        const newPreviousSlide = this.carouselSlides[this.previousSlideIndex];

        newCurrentSlide.classList.add('u-transitionduration--0');

        if (directionIsForwards) {

            newCurrentSlide.classList.add('s-carousa11y__slide--next');
            newCurrentSlide.classList.remove('s-carousa11y__slide--previous');

        } else {

            newCurrentSlide.classList.add('s-carousa11y__slide--previous');
            newCurrentSlide.classList.remove('s-carousa11y__slide--next');

        }

        // double-wrap a rAF call to ensure the browser updates the DOM with CSS classes and re-renders *before* executing the rest of the function
        window.requestAnimationFrame(() => {

            window.requestAnimationFrame(() => {
            
                newCurrentSlide.classList.remove('u-transitionduration--0');
                
                newCurrentSlide.classList.add('s-carousa11y__slide--current');
                oldCurrentSlide.classList.remove('s-carousa11y__slide--current');
                
                setTimeout(() => {
                    this._setCurrentControl(slideIndex);
                    oldCurrentSlide.setAttribute('aria-hidden', 'true');
                    newCurrentSlide.removeAttribute('aria-hidden');

                    this._setAnnounceMessage(`Slide ${this.currentSlide} of ${this.carouselSlides.length}`);

                    newCurrentSlide.classList.remove('s-carousa11y__slide--next');
                    newCurrentSlide.classList.remove('s-carousa11y__slide--previous');
                    oldPreviousSlide.classList.remove('s-carousa11y__slide--previous');
                    newPreviousSlide.classList.add('s-carousa11y__slide--previous');
                    oldNextSlide.classList.remove('s-carousa11y__slide--next');
                    newNextSlide.classList.add('s-carousa11y__slide--next');
     
                    if (setFocus) {
                        newCurrentSlide.setAttribute('tabindex', '-1');
                        newCurrentSlide.focus();
                    }

                }, this.transitionTime);

            });

        });

    }

    /**
     * Sets aria-current on the appropriate 'go to' button, if applicable
     * @param {number} slideIndex - index of the 'go to' button that should be set to current
     */
    _setCurrentControl(slideIndex) {

        Array.from(this.carouselRoot.querySelectorAll(`button[data-slide-button]`)).forEach((button, index) => {

            if (index === slideIndex) {
                button.setAttribute('aria-current', 'true');
                button.classList.add('s-carousa11y__button--current');
            } else {
                button.removeAttribute('aria-current');
                button.classList.remove('s-carousa11y__button--current');
            }

        });
        
    }

    // Control creation methods

    /**
     * @return {HTMLDivElement} - Returns a <div> with the appropriate attributes for the aria-live slide announcement element, for insertion into the DOM.
     */
    _createAnnounceElement() {
    let announceElement = document.createElement('div');
        announceElement.id = 'carousa11yAnnounceElement';
        announceElement.setAttribute('aria-live', 'polite');
        announceElement.setAttribute('aria-atomic', 'true');
        announceElement.classList.add('c-carousa11y__announce', 'u-display--screenreader-only');

        return announceElement;
    }

    /**
     * @return {HTMLUListElement} - Returns a <ul> with nested previous/next slide buttons, for insertion into the DOM.
     */
    _createPrevNextControls() {

        let controlsElement = document.createElement('ul');
        controlsElement.classList.add('c-carousa11y__controls', 'c-carousa11y__controls--prev-next');

        controlsElement.innerHTML = 

            "<li class='c-carousa11y__controls-item c-carousa11y__controls-item--prev'>" +

                "<button id='carousa11yPrevButton' class='c-carousa11y__button c-carousa11y__button--prev'>" +

                    "<span class='u-display--screenreader-only'>Go to previous slide</span>" +

                    "<!-- Zondicons by Steve Schroger (modified) - http://www.zondicons.com/ -->" +
                    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' class='c-carousa11y__button-icon' aria-hidden='true' role='presentation'><path d='M7.05 9.293L6.343 10 12 15.657l1.414-1.414L9.172 10l4.242-4.243L12 4.343z'/></svg>" +

                "</button>" +

            "</li>" +

            "<li class='c-carousa11y__controls-item c-carousa11y__controls-item--next'>" +

                "<button id='carousa11yNextButton' class='c-carousa11y__button c-carousa11y__button--next'>" +

                    "<span class='u-display--screenreader-only'>Go to next slide</span>" +

                    "<!-- Zondicons by Steve Schroger (modified) - http://www.zondicons.com/ -->" +
                    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' class='c-carousa11y__button-icon' aria-hidden='true' role='presentation'><path d='M12.95 10.707l.707-.707L8 4.343 6.586 5.757 10.828 10l-4.242 4.243L8 15.657l4.95-4.95z'/></svg>" +

                "</button>" +

            "</li>";

        return controlsElement;
    }

    /**
     * @param {boolean} currentlyPlaying - If true, the returned button will be toggled to play mode on.
     * @return {HTMLButtonElement} - Returns a <button> to serve as a play/stop toggle for insertion into the DOM.
     */
    _createPlayStopButton(currentlyPlaying) {

        let playStopButton = document.createElement('button');
        playStopButton.setAttribute('id', 'carousa11yPlayStopButton');
        playStopButton.setAttribute('aria-label', 'Play');
        playStopButton.setAttribute('aria-pressed', currentlyPlaying ? 'true' : 'false');
        playStopButton.dataset.state = currentlyPlaying === true ? 'playing' : 'stopped';
        playStopButton.className = `c-carousa11y__button c-carousa11y__button--play-stop ${currentlyPlaying ? 's-carousa11y__button--playing' : 's-carousa11y__button--stopped'}`;
        playStopButton.innerHTML = 

            '<!-- Zondicons by Steve Shroger (modified) - http://www.zondicons.com/ -->' +
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-5 -5 30 30" class="c-carousa11y__button-icon c-carousa11y__button-icon--play" aria-hidden="true" role="presentation"><path class="c-carousa11y__button-icon--play__triangle" d="M4 4l12 6-12 6z"/><path class="c-carousa11y__button-icon--play__crossline" d="M2 2L18 18" stroke="#eb0000"/><path class="c-carousa11y__button-icon--play__crossline" d="M18 2L2 18" stroke="#eb0000"/></svg>';

        return playStopButton;

    }

    /**
     * @param {number} slideCount - Number of slides in the carousel.
     * @return {HTMLOListElement} - Returns an <ol> with nested buttons to advance to a particular slide for insertion into the DOM.
     */
    _createGoToSlideControls(slideCount) {

        let goToControlsElement = document.createElement('ol');
        goToControlsElement.classList.add('c-carousa11y__controls', 'c-carousa11y__controls--goto');

        for (let i = 0; i < slideCount; i++) {

            let goToSlideItem = document.createElement('li');
            goToSlideItem.classList.add('c-carousa11y__controls-item', 'c-carousa11y__controls-item--go-to-slide');

            let goToSlideButton = document.createElement('button');
            goToSlideButton.classList.add('c-carousa11y__button', 'c-carousa11y__button--go-to-slide');
            goToSlideButton.dataset.slideButton = i + 1;
            goToSlideButton.innerHTML = 
            
                `<span class="u-display--screenreader-only">Go to slide ${i + 1}</span>` +
                '<svg xlmns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" class="c-carousa11y__button-icon c-carousa11y__button-icon--go-to-slide"><circle cx="10" cy="10" r="2"></svg>';

            if (i === this._currentSlide) {
                goToSlideButton.setAttribute('aria-current', 'true');
            }

            goToSlideItem.appendChild(goToSlideButton);
            goToControlsElement.appendChild(goToSlideItem);

        }

        return goToControlsElement;

    }

}