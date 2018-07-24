import * as Konva from "konva";
import { Shape } from "./Shape";

export class Line extends Shape {

  private strokeWidth: number = 2;

  private x1: number;
  private y1: number;
  private x2: number;
  private y2: number;
  
  public constructor(name: string, x1: number, y1: number, x2: number, y2: number) {
    super(name);

    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;

    this.instance = this.createKonvaLine(x1, y1, x2, y2);
  }
  
  public getLeft(): number {
    return this.instance.x();
  }
  
  public getTop(): number {
    return this.instance.y();
  }
  
  private createKonvaLine(x1: number, y1: number, x2: number, y2: number): Konva.Line {
    return new Konva.Line({
      points: [ x1, y1, x2, y2 ],
      stroke: "red",
      strokeWidth: this.strokeWidth
    });
  }
}
