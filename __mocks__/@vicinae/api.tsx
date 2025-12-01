import React from 'react';

export const closeMainWindow = jest.fn();
export const getPreferenceValues = jest.fn(() => ({}));
export const open = jest.fn();
export const showToast = jest.fn();
export const Toast = {
  Style: {
    Failure: 'failure',
  },
};

export function Action(props: any) {
  return <button onClick={props.onAction}>{props.title}</button>;
}
Action.Open = (props: any) => <button onClick={props.onAction}>{props.title}</button>;
Action.ShowInFinder = (props: any) => <button>{props.path}</button>;
Action.Style = {
  Destructive: 'destructive',
};
Action.Panel = (props: any) => <div>{props.children}</div>;
Action.Panel.Section = (props: any) => <div>{props.children}</div>;


export const ActionPanel = (props: any) => <div>{props.children}</div>;
ActionPanel.Section = (props: any) => <div>{props.children}</div>;

export const Icon = {
  Pin: 'pin',
  PinDisabled: 'pin-disabled',
  ArrowUp: 'arrow-up',
  ArrowDown: 'arrow-down',
  Trash: 'trash',
};

export function List(props: any) {
  return <ul>{props.children}</ul>;
}
List.EmptyView = (props: any) => <div>{props.title}</div>;
List.Section = (props: any) => <div>{props.children}</div>;
List.Item = (props: any) => <li>{props.title}</li>;