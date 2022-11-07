import api=require("../../../Common/routes/group")
import generate=require("./base")
const req={	create:generate(api.create),	remove:generate(api.remove),	exportJSON:generate(api.exportJSON),	importJSON:generate(api.importJSON),	move:generate(api.move),	merge:generate(api.merge),}
export =req