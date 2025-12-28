const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const assert = require("assert");

describe("SauceDemo - Improve with Hooks", function () {
  this.timeout(60000);
  let driver;

  // ===== BEFORE: setup browser + login sekali =====
  before(async function () {
    const options = new chrome.Options();
    options.addArguments(
      "--disable-notifications",
      "--disable-infobars",
      "--disable-save-password-bubble",
      "--disable-password-manager",
      "--disable-features=PasswordLeakDetection"
    );

    options.setUserPreferences({
      "credentials_enable_service": false,
      "profile.password_manager_enabled": false
    });

    driver = await new Builder()
      .forBrowser("chrome")
      .setChromeOptions(options)
      .build();

    // Login
    await driver.get("https://www.saucedemo.com/");
    await driver.findElement(By.id("user-name")).sendKeys("standard_user");
    await driver.findElement(By.id("password")).sendKeys("secret_sauce");
    await driver.findElement(By.id("login-button")).click();

    await driver.wait(
      until.elementLocated(By.className("inventory_list")),
      10000
    );
  });

  // ===== BEFORE EACH: reset cart =====
  beforeEach(async function () {
    await driver.get("https://www.saucedemo.com/cart.html");

    const removeButtons = await driver.findElements(
      By.xpath("//button[text()='Remove']")
    );

    for (let btn of removeButtons) {
      await btn.click();
    }

    await driver.get("https://www.saucedemo.com/inventory.html");
  });

  // ===== TEST 1 =====
  it("Berhasil masuk ke halaman inventory", async function () {
    const inventory = await driver.findElement(
      By.className("inventory_list")
    );
    assert.ok(await inventory.isDisplayed());
  });

  // ===== TEST 2 (VALIDASI PALING BENAR) =====
  it("Berhasil add item ke cart", async function () {
    // Add item
    await driver.findElement(
      By.id("add-to-cart-sauce-labs-backpack")
    ).click();

    // Masuk ke cart page
    await driver.findElement(
      By.className("shopping_cart_link")
    ).click();

    // Validasi item benar-benar ada di cart
    const cartItem = await driver.wait(
      until.elementLocated(By.className("cart_item")),
      5000
    );

    assert.ok(await cartItem.isDisplayed());
  });

  // ===== AFTER =====
  after(async function () {
    await driver.quit();
  });
});
