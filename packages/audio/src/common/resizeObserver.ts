export const subscribeResizeObserver = (
  element: Element,
  callback: () => Promise<void>,
) => {
  let isEntry = true;
  const observer = new ResizeObserver(() => {
    if (isEntry) {
      isEntry = false;
      return;
    }
    void callback();
  });
  observer.observe(element);
  return () => {
    observer.disconnect();
  };
};
