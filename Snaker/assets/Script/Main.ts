
const { ccclass, property } = cc._decorator;
enum Status {
    up = 'up',
    down = 'down',
    left = 'left',
    right = 'right'
}
@ccclass
export default class NewClass extends cc.Component {

    //计数秒
    numb: number = 0;

    //食物预制体
    foodFab: cc.Prefab = null

    //现存食物节点
    currentFood: cc.Node = null

    //蛇预制体
    snakerFab: cc.Prefab = null;

    //蛇头节点
    snakerHead: cc.Node = null

    //蛇节点
    snakerList: cc.Node[] = [];

    //位移增量
    gap: number = 25;

    //方向状态
    point: Status = null

    //记录上一次的位置
    prePos: { x: number, y: number }[] = []




    async onLoad() {
        window['Main'] = this
        //加载资源
        this.snakerFab = await new Promise((resolve, reject) => {
            cc.loader.loadRes("Prefabs/snaker", cc.Prefab, (err, res) => {
                resolve(res)
            })
        })
        this.foodFab = await new Promise((resolve, reject) => {
            cc.loader.loadRes("Prefabs/food", cc.Prefab, (err, res) => {
                resolve(res)
            })
        })
        this.addNode(this.foodFab, this.randomPos())

        //设置蛇头初始位置 并挂载到head上
        this.addNode(this.snakerFab)

        this.setPos(this.snakerList[0], cc.v2(0, 0))
        this.snakerHead = this.snakerList[0]

        //监听键盘事件改变蛇方向
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.changeDirection, this);
    }

    update(dt) {
        //一秒更新一次
        if (this.numb == 15) {
            this.numb = 0

            //更新蛇头位置
            this.updataSnakerHead()
            //更新蛇身体
            this.upSnakerBody()
            //判断是否吃到食物
            this.isEatFood()
            //是否碰撞自身或者墙壁
            this.isCollide()

        }
        this.numb++

    }

    //更新蛇头位置
    updataSnakerHead() {
        if (this.snakerHead) {
            this.prePos[0] = {
                x: this.snakerList[0].x,
                y: this.snakerList[0].y
            }

            switch (this.point) {
                case 'up':
                    this.snakerHead.y = this.snakerHead.y + this.gap;
                    break;
                case 'down':
                    this.snakerHead.y = this.snakerHead.y - this.gap;
                    break;
                case 'left':
                    this.snakerHead.x = this.snakerHead.x - this.gap;
                    break;
                case 'right':
                    this.snakerHead.x = this.snakerHead.x + this.gap;
                    break;
            }
            // console.log(this.prePos);

        }
    }


    //更新蛇身体位置信息
    upSnakerBody() {
        for (let i = 1; i < this.snakerList.length; i++) {
            this.prePos[i] = {
                x: this.snakerList[i].x,
                y: this.snakerList[i].y
            }
            this.snakerList[i].setPosition(cc.v2(this.prePos[i - 1].x, this.prePos[i - 1].y))
        }
    }


    //改变蛇头行走
    changeDirection(event) {

        switch (event.keyCode) {
            case cc.macro.KEY.a:
                if (this.point != 'right') {
                    this.point = Status.left
                }
                break;
            case cc.macro.KEY.w:
                if (this.point != 'down') {
                    this.point = Status.up
                }
                
                break;
            case cc.macro.KEY.d:
                if (this.point != 'left') {
                    this.point = Status.right
                }
                break;
            case cc.macro.KEY.s:
                if (this.point != 'up') {
                    this.point = Status.down
                }
                break;
        }

    }

    //增加节点
    addNode(prefab: cc.Prefab, pos?: cc.Vec2 | cc.Vec3) {
        var newNode = cc.instantiate(prefab);
        if (prefab === this.snakerFab) {
            this.snakerList.push(newNode)
        }
        if (prefab === this.foodFab) {
            this.currentFood = newNode
        }
        if (pos) {
            this.setPos(newNode, pos)
        }
        this.node.addChild(newNode)
    }

    //食物随机位置
    randomPos() {

        let x = (0.5 - Math.random()) * 910;
        let y = (0.5 - Math.random()) * 590;
        x = Math.floor(x / 25) * 25
        y = Math.floor(y / 25) * 25
        console.log('食物坐标在', x, y);

        return cc.v2(x, y)
    }

    //设置位置
    setPos(node: cc.Node, pos: cc.Vec2 | cc.Vec3) {
        node.setPosition(pos)
    }

    //获取蛇头跟食物之间的距离是否小于25
    getPosFromHeadToFood() {

        if (this.snakerHead && this.currentFood) {


            if (this.snakerHead.position.sub(this.currentFood.position).mag() < 25) {
                return true
            }
            return false
        }


    }
    //小于25销毁食物,生成新食物增加蛇身体
    isEatFood() {
        if (this.getPosFromHeadToFood()) {
            this.currentFood.destroy()
            this.addNode(this.foodFab, this.randomPos())
            this.addNode(this.snakerFab)
            this.upSnakerBody()
        }
    }
    //判断是否碰到尾巴或者墙壁
    isCollide() {
        if (this.snakerHead) {
            for (let i = 1; i < this.snakerList.length; i++) {
                if (this.snakerHead.position.sub(this.snakerList[i].position).mag()<25) {
                    this.gameEnd()
                }
            }
            if (Math.abs(this.snakerHead.x) > 525 || Math.abs(this.snakerHead.y) > 275) {
                this.gameEnd()
            }
        }

    }
    gameEnd() {
        this.node.active =false
    }
}
