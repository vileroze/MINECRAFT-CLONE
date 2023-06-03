import { useFrame, useThree } from "@react-three/fiber"
import { useSphere } from "@react-three/cannon"
import { Vector3 } from "three"
import { useEffect, useRef } from "react"
import { useKeyboard } from "../hooks/useKeyBoard"

const JUMP_FORCE = 3;
const SPEED = 4;

export const Player = () =>{
    const { moveBackward, moveForward, moveRight, moveLeft, jump } = useKeyboard()

	const { camera } = useThree()
	const [ref, api] = useSphere(() => ({
		mass: 1,
		type: 'Dynamic',
		position: [0, 1, 0],
	}))

    //TRACK VELOCITY
    //creating a reference that tracks the above sphere position
    const vel = useRef([0,0,0])

    //make above 'pos' folloe the sphere position
    useEffect(() => {
		api.velocity.subscribe((v) => vel.current = v)
	}, [api.velocity])


    //TRACK POSITION
    //creating a reference that tracks the above sphere position
    const pos = useRef([0, 0, 0])

    //make above 'pos' follow the sphere position
    useEffect(() => {
		api.position.subscribe((p) => pos.current = p)
	}, [api.position])

    //attach the camera to 'pos'
    useFrame(() => {
        camera.position.copy(new Vector3(pos.current[0], pos.current[1], pos.current[2]))

		const direction = new Vector3()

		const frontVector = new Vector3(
			0,
			0,
			(moveBackward ? 1 : 0) - (moveForward ? 1 : 0)
		)

        const sideVector = new Vector3(
			(moveLeft ? 1 : 0) - (moveRight ? 1 : 0),
			0,
			0,
		)

        //make sure front and side vectors are correct in relation to the camera
        direction
			.subVectors(frontVector, sideVector)
			.normalize()
			.multiplyScalar(SPEED)
			.applyEuler(camera.rotation)
        
        //take the above direction vector and apply it to the  sphere
        api.velocity.set(direction.x, vel.current[1], direction.z)

        //player jump
        if (jump && Math.abs(vel.current[1]) < 0.05) {
			api.velocity.set(vel.current[0], JUMP_FORCE, vel.current[2])
		}
        
    })

    return (
        <mesh ref={ref}></mesh>
    )
}