import { MotionProps } from "motion/react";
import type { ComponentProps, JSX, JSXElementConstructor } from "react";
import React from "react";

type IntrinsicElements = JSX.IntrinsicElements;
type ElementConstructor<T> = JSXElementConstructor<T>;
// Custom component props including HTML attributes and custom props
type CustomComponentProps<
  T extends keyof JSX.IntrinsicElements | JSXElementConstructor<any>,
  CustomProps = {}
> = React.HTMLProps<T> & CustomProps;

// Component that accepts HTML attributes and custom props
export type CustomSlottedComponent<
  T extends keyof JSX.IntrinsicElements | JSXElementConstructor<any>,
  CustomProps = {}
> = React.FC<CustomComponentProps<T, CustomProps>>;

// Motion component that includes both HTML attributes and motion props & custom props
export type MotionComponent<
  T extends keyof IntrinsicElements | ElementConstructor<any>,
  CustomProps = {}
> = ComponentProps<T> & MotionProps & CustomProps;

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export type FeatureFlags = {
  [key: string]: boolean;
} & {
  dashboard: boolean;
  logs: boolean;
  logout: boolean;
  copilot: boolean;
  configurations: boolean;
};
