import Status from "../../types/enums/Status";
import TokenType from "./enums/TokenType";

interface TokenPayload {
    id: string,
    status: Status,
    username: string,
    email: string,
    role: string,
    type: TokenType
};

export { TokenPayload };