import api=require("../../../Common/routes/poll")
import generate=require("./base")
const req={	save:generate(api.save),	remove:generate(api.remove),	item:generate(api.item),}
export =req