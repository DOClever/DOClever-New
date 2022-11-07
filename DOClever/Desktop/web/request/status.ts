import api=require("../../../Common/routes/status")
import generate=require("./base")
const req={	save:generate(api.save),	remove:generate(api.remove),	list:generate(api.list),	exportJSON:generate(api.exportJSON),	importJSON:generate(api.importJSON),}
export =req