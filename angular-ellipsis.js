/**
 *	Angular directive to truncate multi-line text to visible height
 *
 *	@param bindContent (angular bound value to append) REQUIRED
 *
 *	@example <p ellipsis bind-content="boundData"></p>
 *
 */
angular.module('dibari.angular-ellipsis', [])

.directive('ellipsis', ['$timeout', '$window', '$sce', function($timeout, $window, $sce) {

  var AsyncDigest = function(delay) {
    var timeout = null;
    var queue = [];

    this.remove = function(fn) {
      if (queue.indexOf(fn) !== -1) {
        queue.splice(queue.indexOf(fn), 1);
        if (queue.length === 0) {
          $timeout.cancel(timeout);
          timeout = null;
        }
      }
    };
    this.add = function(fn) {
      if (queue.indexOf(fn) === -1) {
        queue.push(fn);
      }
      if (!timeout) {
        timeout = $timeout(function() {
          var copy = queue.slice();
          timeout = null;
          // reset scheduled array first in case one of the functions throws an error
          queue.length = 0;
          copy.forEach(function(fn) {
            fn();
          });
        }, delay);
      }
    };
  };

  var asyncDigestImmediate = new AsyncDigest(0);
  var asyncDigestDebounced = new AsyncDigest(75);

  return {
    restrict: 'A',
    scope: {
      bindContent: '=',
      ellipsisSeparatorReg: '=',
      ellipsisFallbackFontSize:'@',
    },
    compile: function() {
      return function(scope, element, attributes) {
        /* Window Resize Variables */
        attributes.lastWindowResizeTime = 0;
        attributes.lastWindowResizeWidth = 0;
        attributes.lastWindowResizeHeight = 0;
        attributes.lastWindowTimeoutEvent = null;
        /* State Variables */
        attributes.isTruncated = false;

        function _isDefined(value) {
          return typeof(value) !== 'undefined';
        }

        function buildEllipsis() {
          let binding = scope.bindContent;
          let isTrustedHTML = false;
          if ($sce.isEnabled() && angular.isObject(binding) && $sce.getTrustedHtml(binding)) {
            isTrustedHTML = true;
            binding = $sce.getTrustedHtml(binding);
          }
          if (binding) {
            const ellipsisSymbol = '&hellip;';
            const ellipsisSeparator = ' ';
            const ellipsisSeparatorReg = _isDefined(scope.ellipsisSeparatorReg) ? scope.ellipsisSeparatorReg : new RegExp('[' + ellipsisSeparator + ']+', 'gm');

            element.html(binding);

            if (_isDefined(scope.ellipsisFallbackFontSize) && isOverflowed(element)) {
              element.css('font-size', scope.ellipsisFallbackFontSize);
            }

            // When the text has overflow
            if (isOverflowed(element)) {
              const initialMaxHeight = element[0].clientHeight;
              const initialMaxWidth = element[0].clientWidth;
              const separatorLocations = [];

              let match;
              // tslint:disable-next-line:no-conditional-assignment
              while ((match = ellipsisSeparatorReg.exec(binding)) !== null) {
                separatorLocations.push(match.index);
              }

              // We know the text overflows and there are no natural breakpoints so we build a new index
              // With this index it will search for the best truncate location instead of for the best ellipsisSeparator location
              if (separatorLocations.length === 0) {
                let textLength = 5;
                while (textLength <= binding.length) {
                  separatorLocations.push(textLength);
                  textLength += 5;
                }
                separatorLocations.push(binding.length);
              }
              let lowerBound = 0;
              let upperBound = separatorLocations.length - 1;
              let textCutOffIndex, range;
              // Loop while upper bound and lower bound are not confined to the smallest range yet
              while (true) {
                // This is an implementation of a binary search as we try to find the overflow position as quickly as possible
                range = upperBound - lowerBound;
                // tslint:disable-next-line:no-bitwise
                textCutOffIndex = lowerBound + (range >> 1);
                if (range <= 1) {
                  break;
                } else {
                  if (fastIsOverflowing(element, getTextUpToIndex(binding, separatorLocations, textCutOffIndex) + ellipsisSymbol, initialMaxHeight, initialMaxWidth)) {
                    // The match was in the lower half, excluding the previous upper part
                    upperBound = textCutOffIndex;
                  } else {
                    // The match was in the upper half, excluding the previous lower part
                    lowerBound = textCutOffIndex;
                  }
                }
              }
              // We finished the search now we set the new text through the correct binding api
              attributes.isTruncated = true;
              element.html(getTextUpToIndex(binding, separatorLocations, textCutOffIndex) + ellipsisSymbol);

              if(!isTrustedHTML && $sce.isEnabled()) {
                $sce.trustAsHtml(binding);
              }

              //Set data-overflow on element for targeting
              element.attr('data-overflowed', 'true');
            } else {
              element.attr('data-overflowed', 'false');
            }
          } else if (binding === '') {
            element.html('');
            element.attr('data-overflowed', 'false');
          }
        }

        function getTextUpToIndex(binding, separatorLocations, index) {
          const unclosedHTMLTagMatcher = /<[^>]*$/;
          return binding.substr(0, separatorLocations[index]).replace(unclosedHTMLTagMatcher, "");
        }

        function fastIsOverflowing(thisElement, text, initialMaxHeight, initialMaxWidth) {
          thisElement[0].innerHTML = text;
          return thisElement[0].scrollHeight > initialMaxHeight || thisElement[0].scrollWidth > initialMaxWidth;
        }

        /**
         *	Test if element has overflow of text beyond height or max-height
         *
         *	@param thisElement (DOM object)
         *
         *	@return bool
         *
         */
        function isOverflowed(thisElement) {
          return thisElement[0].scrollHeight > thisElement[0].clientHeight || thisElement[0].scrollWidth > thisElement[0].clientWidth;
        }

        /**
         *	Watchers
         */

        /**
         *	Execute ellipsis truncate on bindContent update
         */
        scope.$watch('bindContent', () => {
          asyncDigestImmediate.add(buildEllipsis);
        });

        /**
        *	Execute ellipsis truncate when element becomes visible
        */
        scope.$watch(() => element[0].offsetWidth !== 0 && element[0].offsetHeight !== 0, () => {
          asyncDigestDebounced.add(buildEllipsis);
        });

        function checkWindowForRebuild() {
          if (attributes.lastWindowResizeWidth !== window.innerWidth || attributes.lastWindowResizeHeight !== window.innerHeight) {
            buildEllipsis();
          }

          attributes.lastWindowResizeWidth = window.innerWidth;
          attributes.lastWindowResizeHeight = window.innerHeight;
        }

        var unbindRefreshEllipsis = scope.$on('dibari:refresh-ellipsis', function() {
          asyncDigestImmediate.add(buildEllipsis);
        });
        /**
         *	When window width or height changes - re-init truncation
         */

        function onResize() {
          asyncDigestDebounced.add(checkWindowForRebuild);
        }

        var $win = angular.element($window);
        $win.bind('resize', onResize);

        /**
         * Clean up after ourselves
         */
        scope.$on('$destroy', function() {
          $win.unbind('resize', onResize);
          asyncDigestImmediate.remove(buildEllipsis);
          asyncDigestDebounced.remove(checkWindowForRebuild);
          if (unbindRefreshEllipsis) {
            unbindRefreshEllipsis();
            unbindRefreshEllipsis = null;
          }
        });
      };
    }
  };
}]);
