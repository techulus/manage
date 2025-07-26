export async function runAndLogError(message: string, fn: () => Promise<void>) {
	return fn()
		.then(() => {
			console.log(`Successfully completed ${message}`);
		})
		.catch((error) => {
			console.error(`Error occurred while ${message}:`, error);
		});
}
