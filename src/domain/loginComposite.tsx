import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export abstract class LoginComponent {
  abstract render(): React.JSX.Element;
  abstract validate(values: Record<string, string>): string[];
}

export class InputField extends LoginComponent {
  constructor(
    private name: string,
    private label: string,
    private type: "text" | "email" | "password" = "text"
  ) {
    super();
  }

  render() {
    return (
      <div className="flex flex-col gap-1">
        <Label htmlFor={this.name}>{this.label}</Label>
        <Input id={this.name} name={this.name} type={this.type} />
      </div>
    );
  }

  validate(values: Record<string, string>): string[] {
    if (!values[this.name]) return [`${this.label} es obligatorio`];
    return [];
  }
}

export class CheckboxField extends LoginComponent {
  constructor(private name: string, private label: string) {
    super();
  }

  render() {
    return (
      <div className="flex items-center gap-2">
        <Checkbox id={this.name} name={this.name} />
        <Label htmlFor={this.name} className="text-xs">{this.label}</Label>
      </div>
    );
  }

  validate(): string[] {
    return [];
  }
}

export class LoginComposite extends LoginComponent {
  private children: LoginComponent[] = [];

  agregar(component: LoginComponent) {
    this.children.push(component);
  }

  render() {
    return (
      <>
        {this.children.map((c, index) => (
          <React.Fragment key={index}>{c.render()}</React.Fragment>
        ))}
      </>
    );
  }

  validate(values: Record<string, string>): string[] {
    return this.children.flatMap((c) => c.validate(values));
  }
}