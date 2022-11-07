import api=require("../../../Common/routes/example")
import generate=require("./base")
const req={	editItem:generate(api.editItem),	item:generate(api.item),	list:generate(api.list),	removeItem:generate(api.removeItem),	allList:generate(api.allList),}
export =req