import { useRef, useEffect } from 'react';

const requestAnimationFrame = 
	//@ts-ignore
	window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

const cancelAnimationFrame = 
	//@ts-ignore
	window.cancelAnimationFrame || window.mozCancelAnimationFrame;


const useCanvas = (draw: any, options: any = {}) => {

	const canvasRef = useRef(null);

	useEffect(() => {
		
		const canvas: any = canvasRef.current;
		const context = canvas.getContext(options.context || '2d');
		
		let frameCount = 0;

		let animationFrameId: any;

		const render = () => {
			frameCount++;
			draw(context, frameCount);
			animationFrameId = requestAnimationFrame(render);
		}

		render();

		return () => {
			cancelAnimationFrame(animationFrameId);
		}
	}, [draw]);

	return canvasRef;
}
export default useCanvas;