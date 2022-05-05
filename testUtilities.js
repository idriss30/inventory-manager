const clearHistoryHook = (done) => {
  const clearHistory = () => {
    if (history.state === null) {
      window.removeEventListener("popstate", clearHistory);
      return done();
    }

    history.back();
  };

  window.addEventListener("popstate", clearHistory);

  clearHistory();
};

const removePopStateListeners = () => {
  const popstateListeners = window.addEventListener.mock.calls.filter(
    ([eventName]) => eventName === "popstate"
  );

  popstateListeners.forEach(([eventName, handlerFn]) => {
    window.removeEventListener(eventName, handlerFn);
  });
  jest.restoreAllMocks();
};
module.exports = {
  clearHistoryHook,
  removePopStateListeners,
};
