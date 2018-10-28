import {
	Command,
} from '../models';

export abstract class Processor {
	public abstract async process(command: Command): Promise<void>;
}
