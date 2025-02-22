// Made with Blockbench 3.5.4
// Exported for Minecraft version 1.12.2 or 1.15.2 (same format for both) for entity models animated with GeckoLib
// Paste this class into your mod and follow the documentation for GeckoLib to use animations. You can find the documentation here: https://github.com/bernie-g/geckolib
// Blockbench plugin created by Gecko
public class skeleton extends AnimatedEntityModel<Entity> {

    private final AnimatedModelRenderer body;
	private final AnimatedModelRenderer head;
	private final AnimatedModelRenderer hat;
	private final AnimatedModelRenderer rightArm;
	private final AnimatedModelRenderer leftArm;
	private final AnimatedModelRenderer rightLeg;
	private final AnimatedModelRenderer leftLeg;

    public skeleton()
    {
        textureWidth = 120;
		textureHeight = 16;
		body = new AnimatedModelRenderer(this);
		body.setRotationPoint(0.0F, 10.0F, 0.0F);
		setRotationAngle(body, 0.1745F, 0.0873F, -0.0873F);
		body.setTextureOffset(0, 0).addBox(-4.0F, -10.0F, -2.0F, 8.0F, 12.0F, 4.0F, 0.0F, false);
		body.setModelRendererName("body");
		this.registerModelRenderer(body);

		head = new AnimatedModelRenderer(this);
		head.setRotationPoint(0.0F, -10.0F, 0.0F);
		body.addChild(head);
		setRotationAngle(head, -0.2618F, -0.1745F, -0.3491F);
		head.setTextureOffset(24, 0).addBox(-4.0F, -8.0F, -4.0F, 8.0F, 8.0F, 8.0F, 0.0F, false);
		head.setModelRendererName("head");
		this.registerModelRenderer(head);

		hat = new AnimatedModelRenderer(this);
		hat.setRotationPoint(0.0F, 0.0F, 0.0F);
		head.addChild(hat);
		hat.setTextureOffset(56, 0).addBox(-4.0F, -8.0F, -4.0F, 8.0F, 8.0F, 8.0F, 0.5F, false);
		hat.setModelRendererName("hat");
		this.registerModelRenderer(hat);

		rightArm = new AnimatedModelRenderer(this);
		rightArm.setRotationPoint(-5.0F, -8.0F, 0.0F);
		body.addChild(rightArm);
		setRotationAngle(rightArm, -0.4363F, 0.0F, 0.1745F);
		rightArm.setTextureOffset(88, 0).addBox(-1.0F, -2.0F, -1.0F, 2.0F, 12.0F, 2.0F, 0.0F, false);
		rightArm.setModelRendererName("rightArm");
		this.registerModelRenderer(rightArm);

		leftArm = new AnimatedModelRenderer(this);
		leftArm.setRotationPoint(5.0F, -9.0F, 1.0F);
		body.addChild(leftArm);
		setRotationAngle(leftArm, -1.309F, -0.0873F, -0.0873F);
		leftArm.setTextureOffset(96, 0).addBox(-1.0F, -1.0F, -1.0F, 2.0F, 12.0F, 2.0F, 0.0F, true);
		leftArm.setModelRendererName("leftArm");
		this.registerModelRenderer(leftArm);

		rightLeg = new AnimatedModelRenderer(this);
		rightLeg.setRotationPoint(-2.0F, 12.0F, 0.0F);
		rightLeg.setTextureOffset(104, 0).addBox(-1.0F, 0.0F, -1.0F, 2.0F, 12.0F, 2.0F, 0.0F, false);
		rightLeg.setModelRendererName("rightLeg");
		this.registerModelRenderer(rightLeg);

		leftLeg = new AnimatedModelRenderer(this);
		leftLeg.setRotationPoint(2.0F, 12.0F, 0.0F);
		leftLeg.setTextureOffset(112, 0).addBox(-1.0F, 0.0F, -1.0F, 2.0F, 12.0F, 2.0F, 0.0F, true);
		leftLeg.setModelRendererName("leftLeg");
		this.registerModelRenderer(leftLeg);

		this.rootBones.add(body);
		this.rootBones.add(rightLeg);
		this.rootBones.add(leftLeg);
	}


    @Override
    public ResourceLocation getAnimationFileLocation()
    {
        return new ResourceLocation("MODID", "animations/ANIMATIONFILE.json");
    }
}