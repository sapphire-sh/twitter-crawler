import {
	Command,
} from '~/shared/models';

export abstract class Processor {
	public abstract async process(command: Command): Promise<void>;
}
