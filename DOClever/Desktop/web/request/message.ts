import api=require("../../../Common/routes/message")
import generate=require("./base")
const req={	remove:generate(api.remove),	list:generate(api.list),	clear:generate(api.clear),	new:generate(api.new),	applyList:generate(api.applyList),}
export =req