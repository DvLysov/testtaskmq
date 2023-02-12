import useCanvas from '../hooks/useCanvas';

const Canvas = (props: any) => {

	const {
		data,
		draw, 
		options, 
		...rest 
	} = props;

	const canvasRef = useCanvas(draw, {});

	return <canvas ref={canvasRef}  {...rest} />
}

export default Canvas;
