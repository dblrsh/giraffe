import Foundation

struct BridgeRequest: Decodable {
    let id: UUID
    let bridgeVersion: Int
    let method: String
    let params: [String: JSONValue]
}

enum JSONValue: Decodable {
    case string(String), number(Double), bool(Bool), object([String: JSONValue]), array([JSONValue]), null

    init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if container.decodeNil() { self = .null }
        else if let value = try? container.decode(Bool.self) { self = .bool(value) }
        else if let value = try? container.decode(Double.self) { self = .number(value) }
        else if let value = try? container.decode(String.self) { self = .string(value) }
        else if let value = try? container.decode([String: JSONValue].self) { self = .object(value) }
        else { self = .array(try container.decode([JSONValue].self)) }
    }
}

enum BridgeErrorCode: String {
    case invalidRequest = "INVALID_REQUEST"
    case versionMismatch = "BRIDGE_VERSION_MISMATCH"
    case untrustedSource = "UNTRUSTED_SOURCE"
    case capabilityUnavailable = "CAPABILITY_UNAVAILABLE"
}
