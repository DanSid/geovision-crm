import React from 'react';

const stripMotionProps = (props = {}) => {
  const {
    initial,
    animate,
    exit,
    variants,
    transition,
    whileHover,
    whileTap,
    whileFocus,
    whileInView,
    layout,
    drag,
    dragConstraints,
    dragElastic,
    ...rest
  } = props;
  return rest;
};

const createMotionComponent = (tag = 'div') => React.forwardRef(({ children, ...props }, ref) => {
  const Component = tag;
  return <Component ref={ref} {...stripMotionProps(props)}>{children}</Component>;
});

export const motion = new Proxy({}, {
  get: (_, tag) => createMotionComponent(tag),
});

export const AnimatePresence = ({ children }) => <>{children}</>;
