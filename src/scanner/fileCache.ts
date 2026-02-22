import { FileShameResult } from "../engine/types";

export class FileCache {
	private cache = new Map<
		string,
		{ mtime: number; result: FileShameResult }
	>();

	get(filePath: string, mtime: number): FileShameResult | undefined {
		const entry = this.cache.get(filePath);
		if (entry && entry.mtime === mtime) {
			return entry.result;
		}
		return undefined;
	}

	set(filePath: string, mtime: number, result: FileShameResult): void {
		this.cache.set(filePath, { mtime, result });
	}

	delete(filePath: string): void {
		this.cache.delete(filePath);
	}

	clear(): void {
		this.cache.clear();
	}

	get size(): number {
		return this.cache.size;
	}
}
