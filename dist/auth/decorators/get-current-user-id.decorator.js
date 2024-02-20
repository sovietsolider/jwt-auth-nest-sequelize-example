"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentUserId = void 0;
const common_1 = require("@nestjs/common");
exports.getCurrentUserId = (0, common_1.createParamDecorator)((data, context) => {
    const request = context.switchToHttp().getRequest();
    console.log(request);
    return request.user['sub'];
});
//# sourceMappingURL=get-current-user-id.decorator.js.map