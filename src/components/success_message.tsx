const SuccessMessage = ({ message, show }: { message: string, show: boolean }) => {
    return (<div className={`success-message ${show ? "" : "remove"}`}>
        <h2>{message}</h2>
    </div>);
}
export default SuccessMessage;