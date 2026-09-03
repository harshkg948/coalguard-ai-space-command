import networkx as nx
from typing import List, Dict, Any

class SpatialGraphEngine:
    def __init__(self):
        self.graph = nx.Graph()
        self._initialize_topology()

    def _initialize_topology(self):
        zones = [
            "R01", "R02", "R03", "R04", "R05", "R07", 
            "R10", "R11", "R13", "R14", "R15", "R16", 
            "R17", "R18", "R19", "R20", "R21", "R22", 
            "R23", "R25", "R26"
        ]
        self.graph.add_nodes_from(zones)
        
        edges = [
            ("R01", "R02"), ("R02", "R05"), ("R03", "R07"), ("R05", "R16"),
            ("R10", "R11"), ("R11", "R14"), ("R14", "R16"), ("R15", "R16"),
            ("R15", "R17"), ("R16", "R20"), ("R17", "R18"), ("R17", "R19"),
            ("R18", "R21"), ("R19", "R20"), ("R20", "R23"), ("R21", "R22"),
            ("R22", "R23"), ("R17", "R25"), ("R25", "R26")
        ]
        self.graph.add_edges_from(edges)

    def get_connected_cluster(self, center_node: str, radius: int = 2) -> List[str]:
        if center_node not in self.graph:
            return []
        subgraph = nx.ego_graph(self.graph, center_node, radius=radius)
        return list(subgraph.nodes())

    def analyze_structural_propagation(self, zone_id: str) -> Dict[str, Any]:
        cluster = self.get_connected_cluster(zone_id)
        return {
            "source_zone": zone_id,
            "cluster_nodes": cluster,
            "cluster_size": len(cluster),
            "propagation_risk": "HIGH" if len(cluster) > 4 else "MODERATE"
        }

spatial_engine = SpatialGraphEngine()