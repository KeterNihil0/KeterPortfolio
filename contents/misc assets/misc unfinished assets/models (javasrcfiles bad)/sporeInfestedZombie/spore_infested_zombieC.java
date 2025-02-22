// Made with Blockbench 3.5.4
// Exported for Minecraft version 1.14
// Paste this class into your mod and generate all required imports


public class spore_infested_zombieC extends EntityModel {
	private final RendererModel body;
	private final RendererModel mushroom_2;
	private final RendererModel head;
	private final RendererModel mushroom_1;
	private final RendererModel rightLeg;
	private final RendererModel leftLeg;

	public spore_infested_zombieC() {
		textureWidth = 152;
		textureHeight = 16;

		body = new RendererModel(this);
		body.setRotationPoint(0.0F, 12.0F, 0.0F);
		body.cubeList.add(new ModelBox(body, 0, 0, -4.0F, -12.0F, -2.0F, 8, 12, 4, 0.0F, false));

		mushroom_2 = new RendererModel(this);
		mushroom_2.setRotationPoint(-2.6666F, -12.5831F, 1.2436F);
		body.addChild(mushroom_2);
		setRotationAngle(mushroom_2, 0.5236F, 0.0F, -1.1345F);
		mushroom_2.cubeList.add(new ModelBox(mushroom_2, 64, 12, -0.8992F, -2.129F, -1.0802F, 2, 2, 2, 0.0F, false));
		mushroom_2.cubeList.add(new ModelBox(mushroom_2, 68, 0, -1.8992F, -6.129F, -2.0802F, 4, 4, 4, 0.0F, false));

		head = new RendererModel(this);
		head.setRotationPoint(0.0F, -12.0F, 0.0F);
		body.addChild(head);
		setRotationAngle(head, -0.3491F, 0.1745F, 0.1745F);
		head.cubeList.add(new ModelBox(head, 24, 0, -4.0F, -8.0F, -4.0F, 8, 8, 8, 0.0F, false));

		mushroom_1 = new RendererModel(this);
		mushroom_1.setRotationPoint(-4.0F, -8.0F, 0.0F);
		head.addChild(mushroom_1);
		setRotationAngle(mushroom_1, -0.3491F, 0.0F, -0.6981F);
		mushroom_1.cubeList.add(new ModelBox(mushroom_1, 64, 12, -1.0F, -1.0F, 0.0F, 2, 2, 2, 0.0F, false));
		mushroom_1.cubeList.add(new ModelBox(mushroom_1, 68, 0, -2.0F, -5.0F, -1.0F, 4, 4, 4, 0.0F, false));

		rightLeg = new RendererModel(this);
		rightLeg.setRotationPoint(-1.9F, 12.0F, 0.0F);
		rightLeg.cubeList.add(new ModelBox(rightLeg, 120, 0, -2.0F, 0.0F, -2.0F, 4, 12, 4, 0.0F, false));

		leftLeg = new RendererModel(this);
		leftLeg.setRotationPoint(1.9F, 12.0F, 0.0F);
		leftLeg.cubeList.add(new ModelBox(leftLeg, 136, 0, -2.0F, 0.0F, -2.0F, 4, 12, 4, 0.0F, true));
	}

	@Override
	public void render(Entity entity, float f, float f1, float f2, float f3, float f4, float f5) {
		body.render(f5);
		rightLeg.render(f5);
		leftLeg.render(f5);
	}

	public void setRotationAngle(RendererModel modelRenderer, float x, float y, float z) {
		modelRenderer.rotateAngleX = x;
		modelRenderer.rotateAngleY = y;
		modelRenderer.rotateAngleZ = z;
	}
}