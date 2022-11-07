import api=require("../../../Common/routes/template")
import generate=require("./base")
const req={	edit:generate(api.edit),	item:generate(api.item),	list:generate(api.list),	remove:generate(api.remove),}
export =req