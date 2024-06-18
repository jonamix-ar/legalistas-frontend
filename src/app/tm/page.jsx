import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import Board from "@/components/TeamManager/Board";

const TeamManager = () => {
    return (
        <DefaultLayout>
            <Breadcrumb pageName="Teams " />
            <Board />
        </DefaultLayout>
    );
};

export default TeamManager;