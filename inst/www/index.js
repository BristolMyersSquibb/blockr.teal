/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./srcjs/add-tab.js":
/*!**************************!*\
  !*** ./srcjs/add-tab.js ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   addTab: () => (/* binding */ addTab)
/* harmony export */ });
// this is the weirdest thing, perhaps not surprising from Shiny
// adding this wihtout a massive timeout breaks... the websocket
// and Shiny.setInputValue or any other shiny function stop working
// or are staggered.
const addTab = (locked) => {
  if (locked) return;

  setTimeout(() => {
    $(".navbar-collapse").append(
      `<form class="d-flex" id="add-tab-form">
        <input id="addTitle" class="form-control me-2" type="text" placeholder="Tab title">
        <button id="addSubmit" class="btn btn-outline-dark" type="submit">Add</button>
      </form>`,
    );

    $("#addSubmit").on("click", () => {
      const $el = $("#addTitle");
      const title = $el.val();

      if (!title) {
        $el.addClass("is-invalid");
        return;
      }

      $el.removeClass("is-invalid");
      $el.val("");

      window.Shiny.setInputValue("addTab", title);
    });
  }, 1000);
};


/***/ }),

/***/ "./srcjs/lock.js":
/*!***********************!*\
  !*** ./srcjs/lock.js ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _add_tab__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./add-tab */ "./srcjs/add-tab.js");


let locked = false;

const lockDash = () => {
  if (!locked) {
    $("body").removeClass("blockr-locked");
    return;
  }

  $("body").addClass("blockr-locked");
  $(".remove-tab").hide();

  const $layouts = $(".bslib-sidebar-layout");
  $(".tab-title").off();

  $layouts.find(".sidebar").hide();
  $layouts.find(".collapse-toggle").trigger("click");
  $layouts.find(".collapse-toggle").hide();
  $(".add-stack-wrapper").hide();
  $(".bslib-sidebar-layout > .main").css("grid-column", "1/3");
  $(".masonry-item").css("resize", "none");
};

const onTabRendered = (e) => {
  if (!e.message["shiny-insert-tab"]) return;
  setTimeout(() => {
    lockDash();
  }, 250);
};

$(() => {
  $(document).on("shiny:message", onTabRendered);
  $(document).on("blockr:lock", (e) => {
    locked = e.detail.locked;
    lockDash();
  });

  (0,_add_tab__WEBPACK_IMPORTED_MODULE_0__.addTab)(locked);

  $(document).on("shiny:connected", () => {
    const location = window.location.origin + window.location.pathname;
    window.Shiny.setInputValue("href", location, {
      priority: "event",
    });
  });

  window.Shiny.addCustomMessageHandler("saved", (message) => {
    $("#link-wrapper").show();
  });

  $("body").on("keyup", "#lockName", (e) => {
    if (e.key != "Enter") {
      return;
    }

    $("#save").click();
  });

  $("body").on("click", "#save", () => {
    const title = $("#lockName").val();

    if (title === "") {
      window.Shiny.notifications.show({
        html: "Missing title",
        type: "error",
      });
      return;
    }

    if (title.includes(" ")) {
      window.Shiny.notifications.show({
        html: "Title cannot include spaces",
        type: "error",
      });
      return;
    }

    window.Shiny.setInputValue(
      "savethis",
      {
        title: title,
      },
      { priority: "event" },
    );
  });
});


/***/ }),

/***/ "./srcjs/remove-row.js":
/*!*****************************!*\
  !*** ./srcjs/remove-row.js ***!
  \*****************************/
/***/ (() => {

window.Shiny.addCustomMessageHandler("blockr-app-bind-remove", (msg) => {
  $(".remove-row").off("click");

  $(".remove-row").on("click", (event) => {
    // capture stacks contained in the row
    const stacks = [];
    $(event.target)
      .closest(".masonry-row")
      .find(".stack")
      .each((_, el) => {
        stacks.push($(el).attr("id"));
      });

    // remove row from DOM
    const input = $(event.target).data("id");
    window.Shiny.setInputValue("removeRow", {
      tab: input,
      stacks: stacks,
    });
    $(event.target).closest(".masonry-row").remove();
  });
});


/***/ }),

/***/ "./srcjs/restore.js":
/*!**************************!*\
  !*** ./srcjs/restore.js ***!
  \**************************/
/***/ (() => {

$(() => {
  window.Shiny.addCustomMessageHandler("restored-tab", (msg) => {
    setTimeout(() => {
      $(`#${msg.id}`)
        .find(".stack")
        .find("button.action-button.btn-success")
        .trigger("click");
    }, 1250);
  });
});


/***/ }),

/***/ "./srcjs/save.js":
/*!***********************!*\
  !*** ./srcjs/save.js ***!
  \***********************/
/***/ (() => {

$(() => {
  setTimeout(() => {
    $("#add-tab-form").prepend(
      `<div class="auto-save form-check form-switch w-50">
        <input id="autosave" class="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckDefault">
        <label class="form-check-label" for="flexSwitchCheckDefault">Auto save</label>
      </div>`,
    );

    $("#autosave").on("change", (e) => {
      const state = $(e.target).prop("checked");
      window.Shiny.setInputValue("autosave", state);
    });
  }, 1500);
});


/***/ }),

/***/ "./srcjs/tab-remove.js":
/*!*****************************!*\
  !*** ./srcjs/tab-remove.js ***!
  \*****************************/
/***/ (() => {

window.Shiny.addCustomMessageHandler("remove-tab", function (msg) {
  setTimeout(() => {
    $(".remove-tab").off("click");

    $(".remove-tab").on("click", (e) => {
      let ids = [];
      $(e.target)
        .closest(".tab-pane")
        .find(".stack")
        .each((_index, el) => {
          ids.push($(el).attr("id"));
        });

      const id = $(e.currentTarget).attr("id");

      window.Shiny.setInputValue(id, ids);
    });
  }, 500);
});


/***/ }),

/***/ "./srcjs/tab-title.js":
/*!****************************!*\
  !*** ./srcjs/tab-title.js ***!
  \****************************/
/***/ (() => {

$(() => {
  $(document).on("shiny:message", (e) => {
    if (!e.message["shiny-insert-tab"]) return;

    setTimeout(() => {
      title_();
    }, 1000);
  });
});

const title_ = () => {
  const $title = $(".tab-title");

  $title.off("click");

  $title.on("click", () => {
    $title.replaceWith(
      `<input type="text" class="tab-title-input form-control form-control-sm mx-1" value="${$title.text()}">`,
    );

    handleStackTitle($title.text());
  });
};

const handleStackTitle = (title) => {
  $(".tab-title-input").off("keydown");

  $(".tab-title-input").on("keydown", (e) => {
    if (e.key !== "Enter") return;

    const newTitle = $(e.target).val();

    $(e.target).replaceWith(
      `<h1 class="tab-title cursor-pointer">${newTitle}</h1>`,
    );

    const $nav = $(document).find(`[data-value='${title}']`);
    $nav.attr("data-value", newTitle);

    title_();
  });
};


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
/*!************************!*\
  !*** ./srcjs/index.js ***!
  \************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _lock_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./lock.js */ "./srcjs/lock.js");
/* harmony import */ var _remove_row_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./remove-row.js */ "./srcjs/remove-row.js");
/* harmony import */ var _remove_row_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_remove_row_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _tab_title_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./tab-title.js */ "./srcjs/tab-title.js");
/* harmony import */ var _tab_title_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_tab_title_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _tab_remove_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./tab-remove.js */ "./srcjs/tab-remove.js");
/* harmony import */ var _tab_remove_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_tab_remove_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _restore_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./restore.js */ "./srcjs/restore.js");
/* harmony import */ var _restore_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_restore_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _save_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./save.js */ "./srcjs/save.js");
/* harmony import */ var _save_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_save_js__WEBPACK_IMPORTED_MODULE_5__);







})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNPO0FBQ1A7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQSxLQUFLO0FBQ0wsR0FBRztBQUNIOzs7Ozs7Ozs7Ozs7OztBQzlCbUM7O0FBRW5DOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHOztBQUVILEVBQUUsZ0RBQU07O0FBRVI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0wsR0FBRzs7QUFFSDtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1AsUUFBUSxtQkFBbUI7QUFDM0I7QUFDQSxHQUFHO0FBQ0gsQ0FBQzs7Ozs7Ozs7Ozs7QUN0RkQ7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTzs7QUFFUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0EsR0FBRztBQUNILENBQUM7Ozs7Ozs7Ozs7O0FDckJEO0FBQ0E7QUFDQTtBQUNBLFlBQVksT0FBTztBQUNuQjtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0wsR0FBRztBQUNILENBQUM7Ozs7Ozs7Ozs7O0FDVEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0wsR0FBRztBQUNILENBQUM7Ozs7Ozs7Ozs7O0FDZEQ7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUzs7QUFFVDs7QUFFQTtBQUNBLEtBQUs7QUFDTCxHQUFHO0FBQ0gsQ0FBQzs7Ozs7Ozs7Ozs7QUNsQkQ7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxLQUFLO0FBQ0wsR0FBRztBQUNILENBQUM7O0FBRUQ7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0EsNkZBQTZGLGNBQWM7QUFDM0c7O0FBRUE7QUFDQSxHQUFHO0FBQ0g7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0EsOENBQThDLFNBQVM7QUFDdkQ7O0FBRUEsa0RBQWtELE1BQU07QUFDeEQ7O0FBRUE7QUFDQSxHQUFHO0FBQ0g7Ozs7Ozs7VUN6Q0E7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7Ozs7V0N0QkE7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLGlDQUFpQyxXQUFXO1dBQzVDO1dBQ0E7Ozs7O1dDUEE7V0FDQTtXQUNBO1dBQ0E7V0FDQSx5Q0FBeUMsd0NBQXdDO1dBQ2pGO1dBQ0E7V0FDQTs7Ozs7V0NQQTs7Ozs7V0NBQTtXQUNBO1dBQ0E7V0FDQSx1REFBdUQsaUJBQWlCO1dBQ3hFO1dBQ0EsZ0RBQWdELGFBQWE7V0FDN0Q7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDTm1CO0FBQ007QUFDRDtBQUNDO0FBQ0g7QUFDSCIsInNvdXJjZXMiOlsid2VicGFjazovL2Jsb2Nrci5hcHAvLi9zcmNqcy9hZGQtdGFiLmpzIiwid2VicGFjazovL2Jsb2Nrci5hcHAvLi9zcmNqcy9sb2NrLmpzIiwid2VicGFjazovL2Jsb2Nrci5hcHAvLi9zcmNqcy9yZW1vdmUtcm93LmpzIiwid2VicGFjazovL2Jsb2Nrci5hcHAvLi9zcmNqcy9yZXN0b3JlLmpzIiwid2VicGFjazovL2Jsb2Nrci5hcHAvLi9zcmNqcy9zYXZlLmpzIiwid2VicGFjazovL2Jsb2Nrci5hcHAvLi9zcmNqcy90YWItcmVtb3ZlLmpzIiwid2VicGFjazovL2Jsb2Nrci5hcHAvLi9zcmNqcy90YWItdGl0bGUuanMiLCJ3ZWJwYWNrOi8vYmxvY2tyLmFwcC93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9ibG9ja3IuYXBwL3dlYnBhY2svcnVudGltZS9jb21wYXQgZ2V0IGRlZmF1bHQgZXhwb3J0Iiwid2VicGFjazovL2Jsb2Nrci5hcHAvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL2Jsb2Nrci5hcHAvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9ibG9ja3IuYXBwL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vYmxvY2tyLmFwcC8uL3NyY2pzL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIHRoaXMgaXMgdGhlIHdlaXJkZXN0IHRoaW5nLCBwZXJoYXBzIG5vdCBzdXJwcmlzaW5nIGZyb20gU2hpbnlcbi8vIGFkZGluZyB0aGlzIHdpaHRvdXQgYSBtYXNzaXZlIHRpbWVvdXQgYnJlYWtzLi4uIHRoZSB3ZWJzb2NrZXRcbi8vIGFuZCBTaGlueS5zZXRJbnB1dFZhbHVlIG9yIGFueSBvdGhlciBzaGlueSBmdW5jdGlvbiBzdG9wIHdvcmtpbmdcbi8vIG9yIGFyZSBzdGFnZ2VyZWQuXG5leHBvcnQgY29uc3QgYWRkVGFiID0gKGxvY2tlZCkgPT4ge1xuICBpZiAobG9ja2VkKSByZXR1cm47XG5cbiAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgJChcIi5uYXZiYXItY29sbGFwc2VcIikuYXBwZW5kKFxuICAgICAgYDxmb3JtIGNsYXNzPVwiZC1mbGV4XCIgaWQ9XCJhZGQtdGFiLWZvcm1cIj5cbiAgICAgICAgPGlucHV0IGlkPVwiYWRkVGl0bGVcIiBjbGFzcz1cImZvcm0tY29udHJvbCBtZS0yXCIgdHlwZT1cInRleHRcIiBwbGFjZWhvbGRlcj1cIlRhYiB0aXRsZVwiPlxuICAgICAgICA8YnV0dG9uIGlkPVwiYWRkU3VibWl0XCIgY2xhc3M9XCJidG4gYnRuLW91dGxpbmUtZGFya1wiIHR5cGU9XCJzdWJtaXRcIj5BZGQ8L2J1dHRvbj5cbiAgICAgIDwvZm9ybT5gLFxuICAgICk7XG5cbiAgICAkKFwiI2FkZFN1Ym1pdFwiKS5vbihcImNsaWNrXCIsICgpID0+IHtcbiAgICAgIGNvbnN0ICRlbCA9ICQoXCIjYWRkVGl0bGVcIik7XG4gICAgICBjb25zdCB0aXRsZSA9ICRlbC52YWwoKTtcblxuICAgICAgaWYgKCF0aXRsZSkge1xuICAgICAgICAkZWwuYWRkQ2xhc3MoXCJpcy1pbnZhbGlkXCIpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgICRlbC5yZW1vdmVDbGFzcyhcImlzLWludmFsaWRcIik7XG4gICAgICAkZWwudmFsKFwiXCIpO1xuXG4gICAgICB3aW5kb3cuU2hpbnkuc2V0SW5wdXRWYWx1ZShcImFkZFRhYlwiLCB0aXRsZSk7XG4gICAgfSk7XG4gIH0sIDEwMDApO1xufTtcbiIsImltcG9ydCB7IGFkZFRhYiB9IGZyb20gXCIuL2FkZC10YWJcIjtcblxubGV0IGxvY2tlZCA9IGZhbHNlO1xuXG5jb25zdCBsb2NrRGFzaCA9ICgpID0+IHtcbiAgaWYgKCFsb2NrZWQpIHtcbiAgICAkKFwiYm9keVwiKS5yZW1vdmVDbGFzcyhcImJsb2Nrci1sb2NrZWRcIik7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgJChcImJvZHlcIikuYWRkQ2xhc3MoXCJibG9ja3ItbG9ja2VkXCIpO1xuICAkKFwiLnJlbW92ZS10YWJcIikuaGlkZSgpO1xuXG4gIGNvbnN0ICRsYXlvdXRzID0gJChcIi5ic2xpYi1zaWRlYmFyLWxheW91dFwiKTtcbiAgJChcIi50YWItdGl0bGVcIikub2ZmKCk7XG5cbiAgJGxheW91dHMuZmluZChcIi5zaWRlYmFyXCIpLmhpZGUoKTtcbiAgJGxheW91dHMuZmluZChcIi5jb2xsYXBzZS10b2dnbGVcIikudHJpZ2dlcihcImNsaWNrXCIpO1xuICAkbGF5b3V0cy5maW5kKFwiLmNvbGxhcHNlLXRvZ2dsZVwiKS5oaWRlKCk7XG4gICQoXCIuYWRkLXN0YWNrLXdyYXBwZXJcIikuaGlkZSgpO1xuICAkKFwiLmJzbGliLXNpZGViYXItbGF5b3V0ID4gLm1haW5cIikuY3NzKFwiZ3JpZC1jb2x1bW5cIiwgXCIxLzNcIik7XG4gICQoXCIubWFzb25yeS1pdGVtXCIpLmNzcyhcInJlc2l6ZVwiLCBcIm5vbmVcIik7XG59O1xuXG5jb25zdCBvblRhYlJlbmRlcmVkID0gKGUpID0+IHtcbiAgaWYgKCFlLm1lc3NhZ2VbXCJzaGlueS1pbnNlcnQtdGFiXCJdKSByZXR1cm47XG4gIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgIGxvY2tEYXNoKCk7XG4gIH0sIDI1MCk7XG59O1xuXG4kKCgpID0+IHtcbiAgJChkb2N1bWVudCkub24oXCJzaGlueTptZXNzYWdlXCIsIG9uVGFiUmVuZGVyZWQpO1xuICAkKGRvY3VtZW50KS5vbihcImJsb2Nrcjpsb2NrXCIsIChlKSA9PiB7XG4gICAgbG9ja2VkID0gZS5kZXRhaWwubG9ja2VkO1xuICAgIGxvY2tEYXNoKCk7XG4gIH0pO1xuXG4gIGFkZFRhYihsb2NrZWQpO1xuXG4gICQoZG9jdW1lbnQpLm9uKFwic2hpbnk6Y29ubmVjdGVkXCIsICgpID0+IHtcbiAgICBjb25zdCBsb2NhdGlvbiA9IHdpbmRvdy5sb2NhdGlvbi5vcmlnaW4gKyB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWU7XG4gICAgd2luZG93LlNoaW55LnNldElucHV0VmFsdWUoXCJocmVmXCIsIGxvY2F0aW9uLCB7XG4gICAgICBwcmlvcml0eTogXCJldmVudFwiLFxuICAgIH0pO1xuICB9KTtcblxuICB3aW5kb3cuU2hpbnkuYWRkQ3VzdG9tTWVzc2FnZUhhbmRsZXIoXCJzYXZlZFwiLCAobWVzc2FnZSkgPT4ge1xuICAgICQoXCIjbGluay13cmFwcGVyXCIpLnNob3coKTtcbiAgfSk7XG5cbiAgJChcImJvZHlcIikub24oXCJrZXl1cFwiLCBcIiNsb2NrTmFtZVwiLCAoZSkgPT4ge1xuICAgIGlmIChlLmtleSAhPSBcIkVudGVyXCIpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAkKFwiI3NhdmVcIikuY2xpY2soKTtcbiAgfSk7XG5cbiAgJChcImJvZHlcIikub24oXCJjbGlja1wiLCBcIiNzYXZlXCIsICgpID0+IHtcbiAgICBjb25zdCB0aXRsZSA9ICQoXCIjbG9ja05hbWVcIikudmFsKCk7XG5cbiAgICBpZiAodGl0bGUgPT09IFwiXCIpIHtcbiAgICAgIHdpbmRvdy5TaGlueS5ub3RpZmljYXRpb25zLnNob3coe1xuICAgICAgICBodG1sOiBcIk1pc3NpbmcgdGl0bGVcIixcbiAgICAgICAgdHlwZTogXCJlcnJvclwiLFxuICAgICAgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHRpdGxlLmluY2x1ZGVzKFwiIFwiKSkge1xuICAgICAgd2luZG93LlNoaW55Lm5vdGlmaWNhdGlvbnMuc2hvdyh7XG4gICAgICAgIGh0bWw6IFwiVGl0bGUgY2Fubm90IGluY2x1ZGUgc3BhY2VzXCIsXG4gICAgICAgIHR5cGU6IFwiZXJyb3JcIixcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHdpbmRvdy5TaGlueS5zZXRJbnB1dFZhbHVlKFxuICAgICAgXCJzYXZldGhpc1wiLFxuICAgICAge1xuICAgICAgICB0aXRsZTogdGl0bGUsXG4gICAgICB9LFxuICAgICAgeyBwcmlvcml0eTogXCJldmVudFwiIH0sXG4gICAgKTtcbiAgfSk7XG59KTtcbiIsIndpbmRvdy5TaGlueS5hZGRDdXN0b21NZXNzYWdlSGFuZGxlcihcImJsb2Nrci1hcHAtYmluZC1yZW1vdmVcIiwgKG1zZykgPT4ge1xuICAkKFwiLnJlbW92ZS1yb3dcIikub2ZmKFwiY2xpY2tcIik7XG5cbiAgJChcIi5yZW1vdmUtcm93XCIpLm9uKFwiY2xpY2tcIiwgKGV2ZW50KSA9PiB7XG4gICAgLy8gY2FwdHVyZSBzdGFja3MgY29udGFpbmVkIGluIHRoZSByb3dcbiAgICBjb25zdCBzdGFja3MgPSBbXTtcbiAgICAkKGV2ZW50LnRhcmdldClcbiAgICAgIC5jbG9zZXN0KFwiLm1hc29ucnktcm93XCIpXG4gICAgICAuZmluZChcIi5zdGFja1wiKVxuICAgICAgLmVhY2goKF8sIGVsKSA9PiB7XG4gICAgICAgIHN0YWNrcy5wdXNoKCQoZWwpLmF0dHIoXCJpZFwiKSk7XG4gICAgICB9KTtcblxuICAgIC8vIHJlbW92ZSByb3cgZnJvbSBET01cbiAgICBjb25zdCBpbnB1dCA9ICQoZXZlbnQudGFyZ2V0KS5kYXRhKFwiaWRcIik7XG4gICAgd2luZG93LlNoaW55LnNldElucHV0VmFsdWUoXCJyZW1vdmVSb3dcIiwge1xuICAgICAgdGFiOiBpbnB1dCxcbiAgICAgIHN0YWNrczogc3RhY2tzLFxuICAgIH0pO1xuICAgICQoZXZlbnQudGFyZ2V0KS5jbG9zZXN0KFwiLm1hc29ucnktcm93XCIpLnJlbW92ZSgpO1xuICB9KTtcbn0pO1xuIiwiJCgoKSA9PiB7XG4gIHdpbmRvdy5TaGlueS5hZGRDdXN0b21NZXNzYWdlSGFuZGxlcihcInJlc3RvcmVkLXRhYlwiLCAobXNnKSA9PiB7XG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAkKGAjJHttc2cuaWR9YClcbiAgICAgICAgLmZpbmQoXCIuc3RhY2tcIilcbiAgICAgICAgLmZpbmQoXCJidXR0b24uYWN0aW9uLWJ1dHRvbi5idG4tc3VjY2Vzc1wiKVxuICAgICAgICAudHJpZ2dlcihcImNsaWNrXCIpO1xuICAgIH0sIDEyNTApO1xuICB9KTtcbn0pO1xuIiwiJCgoKSA9PiB7XG4gIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICQoXCIjYWRkLXRhYi1mb3JtXCIpLnByZXBlbmQoXG4gICAgICBgPGRpdiBjbGFzcz1cImF1dG8tc2F2ZSBmb3JtLWNoZWNrIGZvcm0tc3dpdGNoIHctNTBcIj5cbiAgICAgICAgPGlucHV0IGlkPVwiYXV0b3NhdmVcIiBjbGFzcz1cImZvcm0tY2hlY2staW5wdXRcIiB0eXBlPVwiY2hlY2tib3hcIiByb2xlPVwic3dpdGNoXCIgaWQ9XCJmbGV4U3dpdGNoQ2hlY2tEZWZhdWx0XCI+XG4gICAgICAgIDxsYWJlbCBjbGFzcz1cImZvcm0tY2hlY2stbGFiZWxcIiBmb3I9XCJmbGV4U3dpdGNoQ2hlY2tEZWZhdWx0XCI+QXV0byBzYXZlPC9sYWJlbD5cbiAgICAgIDwvZGl2PmAsXG4gICAgKTtcblxuICAgICQoXCIjYXV0b3NhdmVcIikub24oXCJjaGFuZ2VcIiwgKGUpID0+IHtcbiAgICAgIGNvbnN0IHN0YXRlID0gJChlLnRhcmdldCkucHJvcChcImNoZWNrZWRcIik7XG4gICAgICB3aW5kb3cuU2hpbnkuc2V0SW5wdXRWYWx1ZShcImF1dG9zYXZlXCIsIHN0YXRlKTtcbiAgICB9KTtcbiAgfSwgMTUwMCk7XG59KTtcbiIsIndpbmRvdy5TaGlueS5hZGRDdXN0b21NZXNzYWdlSGFuZGxlcihcInJlbW92ZS10YWJcIiwgZnVuY3Rpb24gKG1zZykge1xuICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAkKFwiLnJlbW92ZS10YWJcIikub2ZmKFwiY2xpY2tcIik7XG5cbiAgICAkKFwiLnJlbW92ZS10YWJcIikub24oXCJjbGlja1wiLCAoZSkgPT4ge1xuICAgICAgbGV0IGlkcyA9IFtdO1xuICAgICAgJChlLnRhcmdldClcbiAgICAgICAgLmNsb3Nlc3QoXCIudGFiLXBhbmVcIilcbiAgICAgICAgLmZpbmQoXCIuc3RhY2tcIilcbiAgICAgICAgLmVhY2goKF9pbmRleCwgZWwpID0+IHtcbiAgICAgICAgICBpZHMucHVzaCgkKGVsKS5hdHRyKFwiaWRcIikpO1xuICAgICAgICB9KTtcblxuICAgICAgY29uc3QgaWQgPSAkKGUuY3VycmVudFRhcmdldCkuYXR0cihcImlkXCIpO1xuXG4gICAgICB3aW5kb3cuU2hpbnkuc2V0SW5wdXRWYWx1ZShpZCwgaWRzKTtcbiAgICB9KTtcbiAgfSwgNTAwKTtcbn0pO1xuIiwiJCgoKSA9PiB7XG4gICQoZG9jdW1lbnQpLm9uKFwic2hpbnk6bWVzc2FnZVwiLCAoZSkgPT4ge1xuICAgIGlmICghZS5tZXNzYWdlW1wic2hpbnktaW5zZXJ0LXRhYlwiXSkgcmV0dXJuO1xuXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICB0aXRsZV8oKTtcbiAgICB9LCAxMDAwKTtcbiAgfSk7XG59KTtcblxuY29uc3QgdGl0bGVfID0gKCkgPT4ge1xuICBjb25zdCAkdGl0bGUgPSAkKFwiLnRhYi10aXRsZVwiKTtcblxuICAkdGl0bGUub2ZmKFwiY2xpY2tcIik7XG5cbiAgJHRpdGxlLm9uKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgICR0aXRsZS5yZXBsYWNlV2l0aChcbiAgICAgIGA8aW5wdXQgdHlwZT1cInRleHRcIiBjbGFzcz1cInRhYi10aXRsZS1pbnB1dCBmb3JtLWNvbnRyb2wgZm9ybS1jb250cm9sLXNtIG14LTFcIiB2YWx1ZT1cIiR7JHRpdGxlLnRleHQoKX1cIj5gLFxuICAgICk7XG5cbiAgICBoYW5kbGVTdGFja1RpdGxlKCR0aXRsZS50ZXh0KCkpO1xuICB9KTtcbn07XG5cbmNvbnN0IGhhbmRsZVN0YWNrVGl0bGUgPSAodGl0bGUpID0+IHtcbiAgJChcIi50YWItdGl0bGUtaW5wdXRcIikub2ZmKFwia2V5ZG93blwiKTtcblxuICAkKFwiLnRhYi10aXRsZS1pbnB1dFwiKS5vbihcImtleWRvd25cIiwgKGUpID0+IHtcbiAgICBpZiAoZS5rZXkgIT09IFwiRW50ZXJcIikgcmV0dXJuO1xuXG4gICAgY29uc3QgbmV3VGl0bGUgPSAkKGUudGFyZ2V0KS52YWwoKTtcblxuICAgICQoZS50YXJnZXQpLnJlcGxhY2VXaXRoKFxuICAgICAgYDxoMSBjbGFzcz1cInRhYi10aXRsZSBjdXJzb3ItcG9pbnRlclwiPiR7bmV3VGl0bGV9PC9oMT5gLFxuICAgICk7XG5cbiAgICBjb25zdCAkbmF2ID0gJChkb2N1bWVudCkuZmluZChgW2RhdGEtdmFsdWU9JyR7dGl0bGV9J11gKTtcbiAgICAkbmF2LmF0dHIoXCJkYXRhLXZhbHVlXCIsIG5ld1RpdGxlKTtcblxuICAgIHRpdGxlXygpO1xuICB9KTtcbn07XG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbl9fd2VicGFja19yZXF1aXJlX18ubiA9IChtb2R1bGUpID0+IHtcblx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG5cdFx0KCkgPT4gKG1vZHVsZVsnZGVmYXVsdCddKSA6XG5cdFx0KCkgPT4gKG1vZHVsZSk7XG5cdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsIHsgYTogZ2V0dGVyIH0pO1xuXHRyZXR1cm4gZ2V0dGVyO1xufTsiLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiaW1wb3J0IFwiLi9sb2NrLmpzXCI7XG5pbXBvcnQgXCIuL3JlbW92ZS1yb3cuanNcIjtcbmltcG9ydCBcIi4vdGFiLXRpdGxlLmpzXCI7XG5pbXBvcnQgXCIuL3RhYi1yZW1vdmUuanNcIjtcbmltcG9ydCBcIi4vcmVzdG9yZS5qc1wiO1xuaW1wb3J0IFwiLi9zYXZlLmpzXCI7XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=