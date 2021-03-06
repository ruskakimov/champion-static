const ChampionSocket = require('./../../common/socket');
const Client         = require('../../common/client');

const CashierPaymentMethods = (function() {
    'use strict';

    const VIEWPORT_TABS = 6;
    let $scrollTabsContainer;
    let $prevButton;
    let $nextButton;
    let isVertical;
    let currentFirstTab;

    const load = () => {
        ChampionSocket.wait('authorize').then(() => {
            $scrollTabsContainer  = $('.scrollable-tabs');
            $prevButton = $('.previous-button');
            $nextButton = $('.next-button');
            isVertical = $(window).innerWidth() < 767;
            currentFirstTab = 1;

            $('#payment_methods').find(Client.is_logged_in() ? '#btn-cashier' : '#btn-signup').removeClass('invisible');

            $('#payment_methods_accordian').accordion({
                heightStyle: 'content',
                collapsible: true,
                active     : false,
            });

            $(window).on('orientationchange resize', () => {
                isVertical = $(window).innerWidth() < 767;
            });

            scrollTabContents();
            $nextButton.unbind('click').click(scrollHandler(true));
            $prevButton.unbind('click').click(scrollHandler(false));
            $scrollTabsContainer.scrollEnd(toggleNextAndPrevious, 50);
        });
    };

    const scrollTabContents = () => {
        const $tab_content = $('.tab-content-wrapper');
        $scrollTabsContainer.find('li').click(function(e) {
            e.preventDefault();
            const val = $(this).find('a').attr('rel');
            if (!val) {
                return;
            }
            $(this).parent().find('.tab-selected').removeClass('tab-selected');
            $(this).addClass('tab-selected');
            if (isVertical) {
                $tab_content.animate({ scrollTop: $tab_content.scrollTop() + $(val).position().top }, 500);
            } else {
                $tab_content.animate({ scrollLeft: $tab_content.scrollLeft() + $(val).position().left }, 500);
            }
        });
    };

    const scrollHandler = isNextButton => (e) => {
        e.preventDefault();
        currentFirstTab = updateCurrentFirstTab(isNextButton);
        if (isThereChildrenToScroll()) {
            scroll();
        }
    };

    function toggleNextAndPrevious (e) {
        const $firstTab = $scrollTabsContainer.find(':nth-child(1)');
        const tabSize = isVertical ? $firstTab.height() : $firstTab.width();
        const $this = $(e.target);
        const MIN_DIFF = 5;
        const containerSize = Math.ceil(isVertical ? $scrollTabsContainer.height() : $scrollTabsContainer.width());
        const firstTabPosition = isVertical ? $firstTab.position().top : $firstTab.position().left;
        currentFirstTab = Math.ceil(Math.abs(firstTabPosition / tabSize));
        const lastTabPosition = isVertical ?
            $this.get(0).scrollHeight - $this.scrollTop() :
            $this.get(0).scrollWidth - $this.scrollLeft();

        if (firstTabPosition === 0) {
            hideButton($prevButton);
        } else if (Math.abs(lastTabPosition - containerSize) < MIN_DIFF) {
            hideButton($nextButton);
        } else {
            showBothButtons();
            makeScrollTabsSmall(isVertical);
        }
    }

    const updateCurrentFirstTab = (isDirectionForward) => {
        const tabsCount = $scrollTabsContainer.children().length;
        const end = currentFirstTab + (VIEWPORT_TABS - 1);
        const tabsRemainingInTheEnd = tabsCount - end;
        const tabsRemainingInTheBeginning = currentFirstTab - 1;
        const JUMP = VIEWPORT_TABS - 1;
        if (isDirectionForward) {
            if (tabsRemainingInTheEnd > JUMP) {
                return currentFirstTab + JUMP;
            }
            return currentFirstTab + tabsRemainingInTheEnd;
        }
        if (tabsRemainingInTheBeginning > JUMP) {
            return currentFirstTab - JUMP;
        }
        return currentFirstTab - tabsRemainingInTheBeginning;
    };

    const isThereChildrenToScroll = () => {
        const num_of_tabs = $scrollTabsContainer.children().length;
        return currentFirstTab < num_of_tabs && currentFirstTab > 0;
    };

    const scroll = () => {
        const scrollTo = $scrollTabsContainer.find(`:nth-child(${currentFirstTab})`);
        const scrollPosition = isVertical ? 'scrollTop' : 'scrollLeft';
        const scrollSize =  $scrollTabsContainer[scrollPosition]() + scrollTo.position()[isVertical ? 'top' : 'left'];
        if (isThereChildrenToScroll()) {
            $scrollTabsContainer.animate({ [scrollPosition]: scrollSize  }, 500);
        }
    };

    const hideButton = (element) => {
        element.siblings('div.col-md-10').removeClass('col-md-10').addClass('col-md-11');
        element.siblings('div.hide').removeClass('hide').addClass('col-md-1');
        element.addClass('hide').removeClass('col-md-1');
        $scrollTabsContainer.removeClass('in-the-middle');
    };

    const showBothButtons = () => {
        $prevButton.removeClass('hide').addClass('col-md-1');
        $nextButton.removeClass('hide').addClass('col-md-1');
    };

    const makeScrollTabsSmall = () => {
        if (isVertical) {
            $scrollTabsContainer.addClass('in-the-middle');
        } else {
            $scrollTabsContainer.parent().removeClass('col-md-11').addClass('col-md-10');
        }
    };

    return {
        load: load,
    };
})();

module.exports = CashierPaymentMethods;
