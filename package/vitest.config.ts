import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		globals: true,
		environment: "jsdom",
		coverage: {
			enabled: true,
			reporter: ["text", "json-summary", "json"],
			reportOnFailure: true,
			include: ["src/**"],
			thresholds: {
				lines: 80,
				branches: 80,
				functions: 80,
				statements: 80,
			},
		},
	},
});
