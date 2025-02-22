// Made with Blockbench 3.5.4
// Exported for Minecraft version 1.14
// Paste this class into your mod and generate all required imports


public class infested_arm extends EntityModel {
	private final RendererModel armSeg1;
	private final RendererModel armSeg2;

	public infested_arm() {
		textureWidth = 152;
		textureHeight = 16;

		armSeg1 = new RendererModel(this);
		armSeg1.setRotationPoint(0.0F, 24.0F, 0.0F);
		setRotationAngle(armSeg1, -1.5708F, 0.0F, 0.0F);
		armSeg1.cubeList.add(new ModelBox(armSeg1, 88, 6, -2.0F, 0.0F, -4.0F, 4, 6, 4, 0.0F, false));

		armSeg2 = new RendererModel(this);
		armSeg2.setRotationPoint(0.0F, 24.0F, 0.0F);
		setRotationAngle(armSeg2, -1.5708F, 0.0F, 0.0F);
		armSeg2.cubeList.add(new ModelBox(armSeg2, 88, 0, -2.0F, -6.0F, -4.0F, 4, 6, 4, 0.0F, false));
	}

	@Override
	public void render(Entity entity, float f, float f1, float f2, float f3, float f4, float f5) {
		armSeg1.render(f5);
		armSeg2.render(f5);
	}

	public void setRotationAngle(RendererModel modelRenderer, float x, float y, float z) {
		modelRenderer.rotateAngleX = x;
		modelRenderer.rotateAngleY = y;
		modelRenderer.rotateAngleZ = z;
	}
}