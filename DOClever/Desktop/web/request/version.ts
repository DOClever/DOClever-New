import api=require("../../../Common/routes/version")
import generate=require("./base")
const req={	save:generate(api.save),	list:generate(api.list),	remove:generate(api.remove),	roll:generate(api.roll),}
export =req