import type { Action } from "./Action";
import type { CommandParams } from "./CommandParams";

export default interface Command {
  action: Action;
  params: CommandParams;
}
