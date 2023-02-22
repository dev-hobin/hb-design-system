type HandlerOrUndefined<E> = ((event: E) => void) | undefined;

const handleAll = <E>(event: E, ...handlers: HandlerOrUndefined<E>[]) => {
  return handlers.forEach((handler) => handler?.(event));
};

/**
 * defaultPrevented 여부와 상관없이 이벤트 핸들러를 순차적으로 전부 실행하는 하나의 핸들러로 합쳐주는 함수
 */
export const composeEventHandlers = <E>(...handlers: HandlerOrUndefined<E>[]) => {
  return (event: E) => handleAll(event, ...handlers);
};

/**
 * 이벤트 핸들러들을 하나로 합쳐주면서 첫번째 핸들러가 defaultPrevented 되었는지 여부에 따라 다음 핸들러의 실행을 멈추는 함수
 */
export const composePreventableEventHandlers = <E>(
  handler: HandlerOrUndefined<E>,
  ...preventableEventHandlers: HandlerOrUndefined<E>[]
) => {
  return (event: E) => {
    handler?.(event);
    if (!(event as unknown as Event).defaultPrevented) {
      handleAll(event, ...preventableEventHandlers);
    }
  };
};
