export default class SystemsGroup {
  constructor(world, Systems) {
    this.Systems = Systems;
    this.world = world;
  }

  play() {
    this.Systems.forEach(System => this.world.getSystem(System).play());
  }

  stop() {
    this.Systems.forEach(System => this.world.getSystem(System).stop());
  }
}