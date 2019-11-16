const odf = require("./src/odf");
const assert = require("assert");

const buffer = Buffer.alloc(4096);
for (let i = 0; i < 2048; i++) {
	buffer[i + 2048] = 1;
}
it("works", () => {
	const output = odf(buffer, 1024, 512);
	// assert(output[0] === 0);
	// assert(output[10] === 0);
	// assert(output[4] > 0);
	return;
});
