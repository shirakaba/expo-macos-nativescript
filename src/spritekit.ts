import "@nativescript/macos-node-api";
import "@nativescript/macos-node-api/SpriteKit.d.ts";
import "@nativescript/macos-node-api/GameController.d.ts";
import "@nativescript/macos-node-api/CoreFoundation.d.ts";
import "@nativescript/macos-node-api/CoreGraphics.d.ts";

objc.import("SpriteKit");
objc.import("GameController");

export class ApplicationDelegate
  extends NSObject
  implements NSApplicationDelegate, NSWindowDelegate
{
  static ObjCProtocols = [NSApplicationDelegate, NSWindowDelegate];

  static {
    NativeClass(this);
  }

  applicationDidFinishLaunching(_notification: NSNotification) {
    const menu = NSMenu.new();
    NSApp.mainMenu = menu;

    const appMenuItem = NSMenuItem.new();
    menu.addItem(appMenuItem);

    const appMenu = NSMenu.new();
    appMenuItem.submenu = appMenu;

    appMenu.addItemWithTitleActionKeyEquivalent("Quit", "terminate:", "q");

    const controller = ViewController.new();
    const window = NSWindow.windowWithContentViewController(controller);

    window.title = "SpriteKit";
    window.delegate = this;

    window.backgroundColor = NSColor.colorWithSRGBRedGreenBlueAlpha(
      118 / 255,
      171 / 255,
      235 / 255,
      1,
    );

    window.acceptsMouseMovedEvents = true;

    window.makeKeyAndOrderFront(this);

    NSApp.activateIgnoringOtherApps(false);
  }

  windowWillClose(_notification: NSNotification) {
    NSApp.terminate(this);
  }
}

export class BattlefieldScene
  extends SKScene
  implements SKPhysicsContactDelegate
{
  static ObjCProtocols = [SKPhysicsContactDelegate];

  static ObjCExposedMethods = {
    controllerDidConnect: {
      params: [NSNotification],
      returns: interop.types.void,
    },
  };

  static {
    NativeClass(this);
  }

  controller: GCController | null = null;
  indicator: SKSpriteNode | null = null;
  hero: SKSpriteNode | null = null;
  villain: SKSpriteNode | null = null;
  heroHitCategory!: number;
  villainHitCategory!: number;
  heroTargetPos!: CGPoint;
  heroBaseSpeed!: number;
  villainBaseSpeed!: number;

  initControllerSupport() {
    NSNotificationCenter.defaultCenter.addObserverSelectorNameObject(
      this,
      "controllerDidConnect",
      GCControllerDidBecomeCurrentNotification,
      null,
    );
  }

  didMoveToView(_view: SKView) {
    const indicatorHeight = 22;
    const indicatorSize = this.frame.size;
    indicatorSize.height = indicatorHeight;
    this.indicator = SKSpriteNode.alloc().initWithColorSize(
      NSColor.colorWithSRGBRedGreenBlueAlpha(0, 1, 0, 1),
      indicatorSize,
    );
    this.indicator.position = {
      x: this.frame.size.width / 2,
      y: indicatorHeight / 2,
    };
    this.addChild(this.indicator);

    const heroSize = { width: 25, height: 25 };
    this.hero = SKSpriteNode.alloc().initWithColorSize(
      NSColor.colorWithSRGBRedGreenBlueAlpha(0, 0, 1, 1),
      heroSize,
    );

    const heroPhysicsBody = SKPhysicsBody.bodyWithRectangleOfSize(heroSize);
    heroPhysicsBody.allowsRotation = true;
    heroPhysicsBody.allowsRotation = true;
    heroPhysicsBody.usesPreciseCollisionDetection = false;

    this.hero.physicsBody = heroPhysicsBody;
    this.heroHitCategory = 1;
    this.villainHitCategory = 2;
    this.hero.physicsBody.categoryBitMask = this.heroHitCategory;
    this.hero.physicsBody.contactTestBitMask = this.villainHitCategory;
    this.hero.physicsBody.collisionBitMask = this.villainHitCategory;

    const villainSize = { width: 50, height: 50 };
    this.villain = SKSpriteNode.alloc().initWithColorSize(
      NSColor.colorWithSRGBRedGreenBlueAlpha(1, 0, 0, 1),
      villainSize,
    );

    const villainPhysicsBody =
      SKPhysicsBody.bodyWithRectangleOfSize(villainSize);
    villainPhysicsBody.allowsRotation = true;
    villainPhysicsBody.allowsRotation = true;
    villainPhysicsBody.usesPreciseCollisionDetection = false;

    this.villain.physicsBody = villainPhysicsBody;
    this.villain.physicsBody.categoryBitMask = this.villainHitCategory;
    this.villain.physicsBody.contactTestBitMask = this.heroHitCategory;
    this.villain.physicsBody.collisionBitMask = this.heroHitCategory;

    this.hero.position = {
      x: CGRectGetMidX(this.frame),
      y: 3 * (CGRectGetMidY(this.frame) / 2),
    };

    this.villain.position = {
      x: CGRectGetMidX(this.frame),
      y: CGRectGetMidY(this.frame) / 2,
    };

    this.heroTargetPos = this.hero.position;
    this.heroBaseSpeed = 5 / 1.5;
    this.villainBaseSpeed = 3 / 1.5;

    this.addChild(this.hero);
    this.addChild(this.villain);

    this.physicsWorld.gravity = { dx: 0, dy: 0 };
    this.physicsWorld.contactDelegate = this;
  }

  diffFn(
    baseSpeed: number,
    currentPos: CGPoint,
    targetPos: CGPoint,
    deltaTime: number,
    currentRotationInRadians: number,
  ) {
    const xDiff = targetPos.x - currentPos.x;
    const yDiff = targetPos.y - currentPos.y;

    const angleInRadians = Math.atan2(yDiff, xDiff);
    const speed = baseSpeed / (1000 / deltaTime);
    const maxAdvanceX = Math.cos(angleInRadians) * (speed * deltaTime);
    const maxAdvanceY = Math.sin(angleInRadians) * (speed * deltaTime);

    const x =
      xDiff >= 0
        ? Math.min(currentPos.x + maxAdvanceX, targetPos.x)
        : Math.max(currentPos.x + maxAdvanceX, targetPos.x);
    const y =
      yDiff >= 0
        ? Math.min(currentPos.y + maxAdvanceY, targetPos.y)
        : Math.max(currentPos.y + maxAdvanceY, targetPos.y);

    const degToRad = Math.PI / 180;
    const radToDeg = 180 / Math.PI;
    const extraRotation =
      angleInRadians * radToDeg - currentRotationInRadians * radToDeg;
    const easing = 4;

    const optimalRotation =
      extraRotation < -180
        ? 360 + extraRotation
        : extraRotation > 180
          ? extraRotation - 360
          : extraRotation;
    const optimalEasedRotation = optimalRotation / easing;
    const newRotationInDegrees =
      (currentRotationInRadians + optimalEasedRotation) % 360;

    return {
      point: { x, y },
      rotation: newRotationInDegrees * degToRad,
    };
  }

  update(_currentTime: number) {
    const idealDeltaTime = 60;

    if (
      !this.hero ||
      !this.villain ||
      !this.villainBaseSpeed ||
      !this.heroBaseSpeed ||
      !this.heroTargetPos
    ) {
      return;
    }

    const forVillain = this.diffFn(
      this.villainBaseSpeed,
      this.villain.position,
      this.hero.position,
      idealDeltaTime,
      this.villain.zRotation,
    );
    const forHero = this.diffFn(
      this.heroBaseSpeed,
      this.hero.position,
      this.heroTargetPos,
      idealDeltaTime,
      this.hero.zRotation,
    );

    this.villain.zRotation = forVillain.rotation;
    this.villain.position = forVillain.point;

    this.hero.position = forHero.point;
    this.hero.zRotation = forVillain.rotation;

    if (this.controller) {
      const extendedGamepad = this.controller.extendedGamepad;
      const leftThumbstick = extendedGamepad.leftThumbstick;
      const x = leftThumbstick.xAxis.value;
      const y = leftThumbstick.yAxis.value;
      const deadZone = 0.25;
      const speed = 5;

      if (Math.abs(x) > deadZone || Math.abs(y) > deadZone) {
        this.heroTargetPos = {
          x: this.hero.position.x + x * speed,
          y: this.hero.position.y + y * speed,
        };
      }
    }
  }

  mouseDragged(theEvent: NSEvent) {
    this.heroTargetPos = theEvent.locationInNode(this);
  }

  didBeginContact(contact: SKPhysicsContact) {
    if (!contact.bodyA || !contact.bodyB) {
      return;
    }

    if (
      (contact.bodyA.categoryBitMask === this.villainHitCategory ||
        contact.bodyB.categoryBitMask === this.villainHitCategory) &&
      this.indicator
    ) {
      this.indicator.color = NSColor.redColor;
    }
  }

  didEndContact(contact: SKPhysicsContact) {
    if (!contact.bodyA || !contact.bodyB) {
      return;
    }

    if (
      (contact.bodyA.categoryBitMask === this.villainHitCategory ||
        contact.bodyB.categoryBitMask === this.villainHitCategory) &&
      this.indicator
    ) {
      this.indicator.color = NSColor.greenColor;
    }
  }

  controllerDidConnect(_notif: NSNotification) {
    const controller = GCController.current;
    this.controller = controller;
  }
}

const frameSize = { width: 800, height: 600 };

export class ViewController extends NSViewController {
  static {
    NativeClass(this);
  }

  loadView() {
    this.view = SKView.alloc().initWithFrame({
      origin: { x: 0, y: 0 },
      size: frameSize,
    });
  }

  viewDidLoad() {
    super.viewDidLoad();

    const scene = BattlefieldScene.sceneWithSize(frameSize);
    scene.initControllerSupport();

    scene.scaleMode = SKSceneScaleMode.AspectFill;

    /**
     * @type {SKView}
     */
    // @ts-ignore
    const skView: SKView = this.view;

    skView.presentScene(scene);

    skView.preferredFramesPerSecond = 120;
    skView.showsFPS = true;
    skView.showsNodeCount = true;
    skView.ignoresSiblingOrder = true;
  }
}

const NSApp = NSApplication.sharedApplication;
NSApp.setActivationPolicy(NSApplicationActivationPolicy.Regular);

NSApp.delegate = ApplicationDelegate.new();

NSApplicationMain(0, null);
