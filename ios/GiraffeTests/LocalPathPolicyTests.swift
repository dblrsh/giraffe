import XCTest
@testable import Giraffe

final class LocalPathPolicyTests: XCTestCase {
    func testRootMapsToIndex() {
        XCTAssertEqual(LocalPathPolicy.safeRelativePath("/"), "index.html")
    }

    func testNormalAssetIsAllowed() {
        XCTAssertEqual(LocalPathPolicy.safeRelativePath("/assets/app.js"), "assets/app.js")
    }

    func testTraversalAndBackslashAreRejected() {
        XCTAssertNil(LocalPathPolicy.safeRelativePath("/../secret"))
        XCTAssertNil(LocalPathPolicy.safeRelativePath("/%2e%2e/secret"))
        XCTAssertNil(LocalPathPolicy.safeRelativePath("/assets\\secret"))
    }
}
