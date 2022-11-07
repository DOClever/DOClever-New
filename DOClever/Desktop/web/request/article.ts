import api=require("../../../Common/routes/article")
import generate=require("./base")
const req={	save:generate(api.save),	remove:generate(api.remove),	info:generate(api.info),	list:generate(api.list),}
export =req